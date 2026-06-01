import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRoadmapPdf } from "@/lib/export/roadmap-pdf";

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

  // Fetch all recommendations for this assessment
  const recommendations = await prisma.controlRecommendation.findMany({
    where: { assessmentId },
    orderBy: { priorityScore: "desc" },
  });

  if (recommendations.length === 0) {
    return NextResponse.json(
      { error: "No recommendations found. Generate recommendations first." },
      { status: 400 }
    );
  }

  // Generate the PDF
  const userName = assessment.user.name || assessment.user.email || "Unknown";
  const pdfBuffer = generateRoadmapPdf({
    assessmentName: assessment.name,
    userName,
    exportDate: new Date(),
    recommendations,
  });

  // Return the PDF as a downloadable file
  const buffer = Buffer.from(pdfBuffer);
  const safeFilename = assessment.name.replace(/[^a-zA-Z0-9-_ ]/g, "");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename}-roadmap.pdf"`,
    },
  });
}
