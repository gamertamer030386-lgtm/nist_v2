import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateExcelReport } from "@/lib/export/excel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assessmentId } = await params;

  // Verify assessment exists and belongs to the current user
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (assessment.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch NIST functions with categories and subcategories
  const nistFunctions = await prisma.nistFunction.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          subcategories: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  // Fetch all scores for this assessment (including comments)
  const scores = await prisma.subcategoryScore.findMany({
    where: { assessmentId },
    select: {
      subcategoryId: true,
      currentScore: true,
      targetScore: true,
      comment: true,
    },
  });

  // Generate the Excel report
  const userName = assessment.user.name || assessment.user.email || "Unknown";
  const excelBuffer = await generateExcelReport({
    assessmentName: assessment.name,
    userName,
    exportDate: new Date(),
    nistFunctions,
    scores,
  });

  // Return the Excel file as a downloadable file
  return new NextResponse(new Uint8Array(excelBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${assessment.name.replace(/[^a-zA-Z0-9-_ ]/g, "")}-report.xlsx"`,
    },
  });
}
