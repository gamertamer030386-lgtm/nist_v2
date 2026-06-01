import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  ControlCategory,
  PriorityLevel,
  EffortLevel,
  RoadmapPhase,
} from "@prisma/client";

interface RecommendationExportData {
  id: string;
  subcategoryId: string;
  description: string;
  category: ControlCategory;
  priorityLevel: PriorityLevel;
  effortLevel: EffortLevel;
  priorityScore: number;
  roadmapPhase: RoadmapPhase;
  dependsOnId: string | null;
}

interface RoadmapPdfInput {
  assessmentName: string;
  userName: string;
  exportDate: Date;
  recommendations: RecommendationExportData[];
}

const PHASE_CONFIG: Record<
  RoadmapPhase,
  { title: string; timeRange: string; color: [number, number, number] }
> = {
  QUICK_WIN: {
    title: "Quick Wins",
    timeRange: "0-3 months",
    color: [5, 150, 105], // emerald-600
  },
  SHORT_TERM: {
    title: "Short-term",
    timeRange: "3-6 months",
    color: [37, 99, 235], // blue-600
  },
  MEDIUM_TERM: {
    title: "Medium-term",
    timeRange: "6-12 months",
    color: [217, 119, 6], // amber-600
  },
  LONG_TERM: {
    title: "Long-term",
    timeRange: "12+ months",
    color: [71, 85, 105], // slate-600
  },
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const EFFORT_LABELS: Record<EffortLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const CATEGORY_LABELS: Record<ControlCategory, string> = {
  PEOPLE: "People",
  TOOLS: "Tools",
  PROCESS: "Process",
  PARTNERS: "Partners",
};

/**
 * Generate a PDF report for the implementation roadmap.
 * Returns the PDF as an ArrayBuffer.
 */
export function generateRoadmapPdf(input: RoadmapPdfInput): ArrayBuffer {
  const { assessmentName, userName, exportDate, recommendations } = input;

  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(18);
  doc.text("Implementation Roadmap Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Assessment: ${assessmentName}`, 14, 32);
  doc.text(`Prepared by: ${userName}`, 14, 39);
  doc.text(`Export Date: ${exportDate.toLocaleDateString()}`, 14, 46);

  // --- Summary Statistics ---
  doc.setFontSize(14);
  doc.text("Summary", 14, 60);

  const phaseOrder: RoadmapPhase[] = [
    "QUICK_WIN",
    "SHORT_TERM",
    "MEDIUM_TERM",
    "LONG_TERM",
  ];

  const phaseCounts = phaseOrder.map((phase) => {
    const count = recommendations.filter((r) => r.roadmapPhase === phase).length;
    const config = PHASE_CONFIG[phase];
    return [config.title, config.timeRange, String(count)];
  });

  autoTable(doc, {
    startY: 64,
    head: [["Phase", "Timeline", "Recommendations"]],
    body: phaseCounts,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      2: { halign: "center" },
    },
  });

  // Total count
  const summaryEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.text(
    `Total Recommendations: ${recommendations.length}`,
    14,
    summaryEndY + 8
  );

  // --- Phase Detail Tables ---
  for (const phase of phaseOrder) {
    const phaseRecs = recommendations.filter((r) => r.roadmapPhase === phase);
    if (phaseRecs.length === 0) continue;

    const config = PHASE_CONFIG[phase];

    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(...config.color);
    doc.text(`${config.title} (${config.timeRange})`, 14, 20);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.text(`${phaseRecs.length} recommendation${phaseRecs.length !== 1 ? "s" : ""}`, 14, 28);

    const tableBody = phaseRecs.map((rec) => [
      rec.subcategoryId,
      rec.description.length > 100
        ? rec.description.slice(0, 100) + "…"
        : rec.description,
      CATEGORY_LABELS[rec.category],
      PRIORITY_LABELS[rec.priorityLevel],
      EFFORT_LABELS[rec.effortLevel],
      rec.dependsOnId ? "Yes" : "—",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [
        [
          "Subcategory",
          "Description",
          "Category",
          "Priority",
          "Effort",
          "Dependency",
        ],
      ],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: config.color },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 70 },
        2: { cellWidth: 22 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 22 },
      },
      styles: { fontSize: 8 },
    });
  }

  // --- Dependencies Page ---
  const withDependencies = recommendations.filter((r) => r.dependsOnId);
  if (withDependencies.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Dependency Map", 14, 20);

    doc.setFontSize(10);
    doc.text(
      `${withDependencies.length} recommendation${withDependencies.length !== 1 ? "s" : ""} with dependencies`,
      14,
      28
    );

    // Build lookup
    const idToSubcategory = new Map(
      recommendations.map((r) => [r.id, r.subcategoryId])
    );

    const depBody = withDependencies.map((rec) => {
      const dependsOnSubcategory = idToSubcategory.get(rec.dependsOnId!) ?? "Unknown";
      const recPhase = PHASE_CONFIG[rec.roadmapPhase].title;
      return [rec.subcategoryId, "depends on", dependsOnSubcategory, recPhase];
    });

    autoTable(doc, {
      startY: 32,
      head: [["Recommendation", "Relationship", "Depends On", "Phase"]],
      body: depBody,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
    });
  }

  return doc.output("arraybuffer");
}
