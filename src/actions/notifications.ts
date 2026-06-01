"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

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
 * Creates a notification for a user.
 * Called internally by task assignment and assessment submission flows.
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      referenceId: data.referenceId ?? null,
    },
  });

  return notification;
}

/**
 * Returns all notifications for the current user, ordered by creation time descending.
 */
export async function getNotifications() {
  const { user: currentUser } = await getSessionUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  return notifications;
}

/**
 * Marks a notification as read.
 * Verifies the notification belongs to the current user.
 */
export async function markNotificationRead(notificationId: string) {
  const { user: currentUser } = await getSessionUser();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== currentUser.id) {
    throw new Error("Forbidden: This notification does not belong to you");
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
}

/**
 * Returns the count of unread notifications for the current user.
 */
export async function getUnreadCount() {
  const { user: currentUser } = await getSessionUser();

  const count = await prisma.notification.count({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
  });

  return count;
}
