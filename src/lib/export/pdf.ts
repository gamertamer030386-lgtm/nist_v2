import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ScoreRollup,
  calculateCategoryRollup,
  calculateFunctionRollup,
  getGapColor,
} from "@/lib/scoring";

interface SubcategoryScoreData {
  subcategoryId: string;
  currentScore: number | null;
  targetScore: number | null;
}

interface NistCategoryData {
  id: string;
  name: string;
  subcategories: { id: string }[];
}

interface NistFunctionData {
  id: string;
  name: string;
  categories: NistCategoryData[];
}

interface PdfReportInput {
  assessmentName: string;
  userName: string;
  exportDate: Date;
  nistFunctions: NistFunctionData[];
  scores: SubcategoryScoreData[];
}

/**
 * Map gap color name to RGB values for PDF cell backgrounds.
 */
function getGapColorRgb(color: string): [number, number, number] {
  switch (color) {
    case "green":
      return [200, 230, 200];
    case "yellow":
      return [255, 255, 180];
    case "orange":
      return [255, 210, 150];
    case "red":
      return [255, 180, 180];
    default:
      return [220, 220, 220]; // gray
  }
}

function formatScore(score: number | null): string {
  if (score === null) return "N/A";
  return score.toFixed(2);
}

function formatGap(gap: number | null): string {
  if (gap === null) return "N/A";
  return gap.toFixed(2);
}

/**
 * Generate a PDF report for an assessment.
 * Returns the PDF as an ArrayBuffer.
 */
export function generatePdfReport(input: PdfReportInput): ArrayBuffer {
  const { assessmentName, userName, exportDate, nistFunctions, scores } = input;

  const doc = new jsPDF();

  // Build a lookup map for scores by subcategoryId
  const scoreMap = new Map<
    string,
    { currentScore: number | null; targetScore: number | null }
  >();
  for (const score of scores) {
    scoreMap.set(score.subcategoryId, {
      currentScore: score.currentScore,
      targetScore: score.targetScore,
    });
  }

  // --- Header ---
  doc.setFontSize(18);
  doc.text("NIST CSF 2.0 Maturity Assessment Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Assessment: ${assessmentName}`, 14, 32);
  doc.text(`Prepared by: ${userName}`, 14, 39);
  doc.text(`Export Date: ${exportDate.toLocaleDateString()}`, 14, 46);

  // --- Function Summary Table ---
  doc.setFontSize(14);
  doc.text("Function Summary", 14, 58);

  // Compute function rollups
  const functionRollups: { name: string; rollup: ScoreRollup; categoryRollups: { name: string; rollup: ScoreRollup }[] }[] =
    nistFunctions.map((fn) => {
      const categoryRollups = fn.categories.map((cat) => {
        const subcategoryScores = cat.subcategories.map((sub) => {
          const score = scoreMap.get(sub.id);
          return {
            currentScore: score?.currentScore ?? null,
            targetScore: score?.targetScore ?? null,
          };
        });
        return { name: cat.name, rollup: calculateCategoryRollup(subcategoryScores) };
      });

      const functionRollup = calculateFunctionRollup(
        categoryRollups.map((c) => c.rollup)
      );

      return { name: fn.name, rollup: functionRollup, categoryRollups };
    });

  const summaryBody = functionRollups.map((fn) => [
    fn.name,
    formatScore(fn.rollup.currentScore),
    formatScore(fn.rollup.targetScore),
    formatGap(fn.rollup.gap),
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["Function", "Current Score", "Target Score", "Gap"]],
    body: summaryBody,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    didParseCell: (data) => {
      // Apply gap color to the Gap column (index 3)
      if (data.section === "body" && data.column.index === 3) {
        const fn = functionRollups[data.row.index];
        if (fn) {
          const color = getGapColor(fn.rollup.gap);
          const rgb = getGapColorRgb(color);
          data.cell.styles.fillColor = rgb;
        }
      }
    },
  });

  // --- Category Detail Tables (one per function) ---
  for (const fn of functionRollups) {
    // Add a new page for each function's category detail
    doc.addPage();

    doc.setFontSize(14);
    doc.text(`${fn.name} - Category Details`, 14, 20);

    const categoryBody = fn.categoryRollups.map((cat) => [
      cat.name,
      formatScore(cat.rollup.currentScore),
      formatScore(cat.rollup.targetScore),
      formatGap(cat.rollup.gap),
    ]);

    autoTable(doc, {
      startY: 26,
      head: [["Category", "Current Score", "Target Score", "Gap"]],
      body: categoryBody,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      didParseCell: (data) => {
        // Apply gap color to the Gap column (index 3)
        if (data.section === "body" && data.column.index === 3) {
          const cat = fn.categoryRollups[data.row.index];
          if (cat) {
            const color = getGapColor(cat.rollup.gap);
            const rgb = getGapColorRgb(color);
            data.cell.styles.fillColor = rgb;
          }
        }
      },
    });
  }

  // Return as ArrayBuffer
  return doc.output("arraybuffer");
}
