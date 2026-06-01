"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/authorization";
import { createNotification } from "@/actions/notifications";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createTaskSchema = z.object({
  assignedToId: z.string().min(1, "Assigned user is required"),
  deadline: z.string().min(1, "Deadline is required"),
  instructions: z.string().max(2000, "Instructions must be 2000 characters or less").optional().nullable(),
});

// ─── Helper ──────────────────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, officeId: true, isActive: true },
  });
  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }
  return { session, user };
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/**
 * Creates a new task assignment.
 * Requires Admin role. Verifies target End_User is in Admin's office.
 */
export async function createTaskAssignment(data: {
  assignedToId: string;
  deadline: string;
  instructions?: string | null;
}) {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["ADMIN", "SUPER_ADMIN"]);

  const parsed = createTaskSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data");
  }

  const { assignedToId, deadline, instructions } = parsed.data;

  // Verify Admin has an office
  if (currentUser.role === "ADMIN" && !currentUser.officeId) {
    throw new Error("Forbidden: Admin is not assigned to an office");
  }

  // Verify target user exists and is an End_User in the Admin's office
  const targetUser = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, role: true, officeId: true, isActive: true },
  });

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  if (!targetUser.isActive) {
    throw new Error("Cannot assign tasks to inactive users");
  }

  if (targetUser.role !== "END_USER") {
    throw new Error("Tasks can only be assigned to End Users");
  }

  // Admin can only assign to users in their own office
  if (currentUser.role === "ADMIN") {
    if (targetUser.officeId !== currentUser.officeId) {
      throw new Error("Forbidden: Can only assign tasks to users in your office");
    }
  }

  // Parse deadline date
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    throw new Error("Invalid deadline date");
  }

  const task = await prisma.taskAssignment.create({
    data: {
      assignedToId,
      assignedById: currentUser.id,
      deadline: deadlineDate,
      instructions: instructions ?? null,
      status: "PENDING",
    },
  });

  // Notify the assigned End_User
  await createNotification({
    userId: assignedToId,
    type: "TASK_ASSIGNED",
    title: "New Task Assigned",
    message: `You have been assigned a new assessment task due by ${deadlineDate.toLocaleDateString()}.`,
    referenceId: task.id,
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/tasks");

  return task;
}

/**
 * Returns tasks assigned to the current End_User.
 */
export async function getMyTasks() {
  const { user: currentUser } = await getSessionUser();

  const tasks = await prisma.taskAssignment.findMany({
    where: { assignedToId: currentUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      assignedBy: {
        select: { id: true, name: true, email: true },
      },
      assessment: {
        select: { id: true, name: true },
      },
    },
  });

  return tasks;
}

/**
 * Marks a task as COMPLETED and links the assessment.
 * Verifies the task belongs to the current user.
 */
export async function submitAssessment(taskId: string, assessmentId: string) {
  const { user: currentUser } = await getSessionUser();

  // Verify the task belongs to the current user
  const task = await prisma.taskAssignment.findUnique({
    where: { id: taskId },
    select: { id: true, assignedToId: true, status: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.assignedToId !== currentUser.id) {
    throw new Error("Forbidden: This task is not assigned to you");
  }

  // Verify the assessment exists and belongs to the current user
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true, userId: true },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.userId !== currentUser.id) {
    throw new Error("Forbidden: This assessment does not belong to you");
  }

  // Update task status to COMPLETED and link the assessment
  const updatedTask = await prisma.taskAssignment.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      assessmentId,
    },
    include: {
      assignedBy: { select: { id: true } },
      assignedTo: { select: { name: true, email: true } },
    },
  });

  // Notify the assigning Admin
  await createNotification({
    userId: updatedTask.assignedBy.id,
    type: "ASSESSMENT_SUBMITTED",
    title: "Assessment Submitted",
    message: `${updatedTask.assignedTo.name || updatedTask.assignedTo.email} has submitted their assessment.`,
    referenceId: assessmentId,
  });

  revalidatePath("/tasks");
  revalidatePath("/admin/tasks");

  return updatedTask;
}

/**
 * Returns completed assessments for Admin's office.
 * Requires Admin or Super_Admin role.
 */
export async function getOfficeSubmissions() {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["ADMIN", "SUPER_ADMIN"]);

  if (currentUser.role === "ADMIN" && !currentUser.officeId) {
    throw new Error("Forbidden: Admin is not assigned to an office");
  }

  const whereClause = currentUser.role === "SUPER_ADMIN"
    ? { status: "COMPLETED" as const }
    : {
        status: "COMPLETED" as const,
        assignedTo: { officeId: currentUser.officeId },
      };

  const submissions = await prisma.taskAssignment.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      assessment: {
        select: { id: true, name: true, createdAt: true },
      },
    },
  });

  return submissions;
}

/**
 * Starts an assessment for a task - creates a new assessment, links it to the task,
 * and updates the task status to IN_PROGRESS.
 */
export async function startTaskAssessment(taskId: string) {
  const { user: currentUser } = await getSessionUser();

  // Verify the task belongs to the current user
  const task = await prisma.taskAssignment.findUnique({
    where: { id: taskId },
    select: { id: true, assignedToId: true, status: true, assessmentId: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.assignedToId !== currentUser.id) {
    throw new Error("Forbidden: This task is not assigned to you");
  }

  if (task.status !== "PENDING") {
    throw new Error("Task has already been started");
  }

  // Create a new assessment for this task
  const assessment = await prisma.assessment.create({
    data: {
      name: `Task Assessment - ${new Date().toLocaleDateString()}`,
      userId: currentUser.id,
      officeId: currentUser.officeId ?? undefined,
    },
  });

  // Link assessment to task and update status to IN_PROGRESS
  const updatedTask = await prisma.taskAssignment.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      assessmentId: assessment.id,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/admin/tasks");

  return { task: updatedTask, assessment };
}
