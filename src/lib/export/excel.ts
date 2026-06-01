import ExcelJS from "exceljs";
import {
  calculateCategoryRollup,
  calculateFunctionRollup,
  getGapColor,
} from "@/lib/scoring";

interface SubcategoryScoreData {
  subcategoryId: string;
  currentScore: number | null;
  targetScore: number | null;
  comment: string | null;
}

interface NistCategoryData {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface NistFunctionData {
  id: string;
  name: string;
  categories: NistCategoryData[];
}

interface ExcelReportInput {
  assessmentName: string;
  userName: string;
  exportDate: Date;
  nistFunctions: NistFunctionData[];
  scores: SubcategoryScoreData[];
}

/**
 * Map gap color name to an ARGB hex string for Excel cell fills.
 */
function getGapFillColor(gap: number | null): string {
  const color = getGapColor(gap);
  switch (color) {
    case "green":
      return "FFC8E6C8"; // light green
    case "yellow":
      return "FFFFFFB4"; // light yellow
    case "orange":
      return "FFFFD296"; // light orange
    case "red":
      return "FFFFB4B4"; // light red
    default:
      return "FFDCDCDC"; // gray
  }
}

function formatScore(score: number | null): string | number {
  if (score === null) return "N/A";
  return Math.round(score * 100) / 100;
}

function formatGap(gap: number | null): string | number {
  if (gap === null) return "N/A";
  return Math.round(gap * 100) / 100;
}

/**
 * Apply gap color fill to a cell based on the gap value.
 */
function applyGapFill(cell: ExcelJS.Cell, gap: number | null): void {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: getGapFillColor(gap) },
  };
}

/**
 * Add metadata rows at the top of a worksheet.
 */
function addMetadataRows(
  worksheet: ExcelJS.Worksheet,
  assessmentName: string,
  userName: string,
  exportDate: Date
): void {
  worksheet.addRow(["Assessment:", assessmentName]);
  worksheet.addRow(["Prepared by:", userName]);
  worksheet.addRow(["Export Date:", exportDate.toLocaleDateString()]);
  worksheet.addRow([]); // blank separator row
}

/**
 * Style header row with bold text and blue background.
 */
function styleHeaderRow(row: ExcelJS.Row, columnCount: number): void {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  for (let i = 1; i <= columnCount; i++) {
    const cell = row.getCell(i);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2980B9" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  }
}

/**
 * Generate an Excel report for an assessment.
 * Returns the workbook buffer as an ArrayBuffer.
 */
export async function generateExcelReport(
  input: ExcelReportInput
): Promise<Buffer> {
  const { assessmentName, userName, exportDate, nistFunctions, scores } = input;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = userName;
  workbook.created = exportDate;

  // Build a lookup map for scores by subcategoryId
  const scoreMap = new Map<
    string,
    { currentScore: number | null; targetScore: number | null; comment: string | null }
  >();
  for (const score of scores) {
    scoreMap.set(score.subcategoryId, {
      currentScore: score.currentScore,
      targetScore: score.targetScore,
      comment: score.comment,
    });
  }

  // Compute rollups
  const functionRollups = nistFunctions.map((fn) => {
    const categoryRollups = fn.categories.map((cat) => {
      const subcategoryScores = cat.subcategories.map((sub) => {
        const score = scoreMap.get(sub.id);
        return {
          currentScore: score?.currentScore ?? null,
          targetScore: score?.targetScore ?? null,
        };
      });
      return {
        name: cat.name,
        functionName: fn.name,
        rollup: calculateCategoryRollup(subcategoryScores),
      };
    });

    const functionRollup = calculateFunctionRollup(
      categoryRollups.map((c) => c.rollup)
    );

    return { name: fn.name, rollup: functionRollup, categoryRollups };
  });

  // ─── Worksheet 1: Function Summary ──────────────────────────────────────────
  const funcSheet = workbook.addWorksheet("Function Summary");

  addMetadataRows(funcSheet, assessmentName, userName, exportDate);

  const funcHeaders = ["Function", "Current Score", "Target Score", "Gap"];
  const funcHeaderRow = funcSheet.addRow(funcHeaders);
  styleHeaderRow(funcHeaderRow, funcHeaders.length);

  for (const fn of functionRollups) {
    const row = funcSheet.addRow([
      fn.name,
      formatScore(fn.rollup.currentScore),
      formatScore(fn.rollup.targetScore),
      formatGap(fn.rollup.gap),
    ]);
    applyGapFill(row.getCell(4), fn.rollup.gap);
  }

  // Auto-fit column widths
  funcSheet.columns = [
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
  ];

  // ─── Worksheet 2: Category Summary ──────────────────────────────────────────
  const catSheet = workbook.addWorksheet("Category Summary");

  addMetadataRows(catSheet, assessmentName, userName, exportDate);

  const catHeaders = ["Function", "Category", "Current Score", "Target Score", "Gap"];
  const catHeaderRow = catSheet.addRow(catHeaders);
  styleHeaderRow(catHeaderRow, catHeaders.length);

  for (const fn of functionRollups) {
    for (const cat of fn.categoryRollups) {
      const row = catSheet.addRow([
        fn.name,
        cat.name,
        formatScore(cat.rollup.currentScore),
        formatScore(cat.rollup.targetScore),
        formatGap(cat.rollup.gap),
      ]);
      applyGapFill(row.getCell(5), cat.rollup.gap);
    }
  }

  catSheet.columns = [
    { width: 30 },
    { width: 40 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
  ];

  // ─── Worksheet 3: Subcategory Detail ────────────────────────────────────────
  const subSheet = workbook.addWorksheet("Subcategory Detail");

  addMetadataRows(subSheet, assessmentName, userName, exportDate);

  const subHeaders = [
    "Function",
    "Category",
    "Subcategory ID",
    "Description",
    "Current Score",
    "Target Score",
    "Gap",
    "Comment",
  ];
  const subHeaderRow = subSheet.addRow(subHeaders);
  styleHeaderRow(subHeaderRow, subHeaders.length);

  for (const fn of nistFunctions) {
    for (const cat of fn.categories) {
      for (const sub of cat.subcategories) {
        const score = scoreMap.get(sub.id);
        const current = score?.currentScore ?? null;
        const target = score?.targetScore ?? null;
        const gap =
          current !== null && target !== null ? target - current : null;
        const comment = score?.comment ?? "";

        const row = subSheet.addRow([
          fn.name,
          cat.name,
          sub.id,
          sub.name,
          formatScore(current),
          formatScore(target),
          formatGap(gap),
          comment,
        ]);
        applyGapFill(row.getCell(7), gap);
      }
    }
  }

  subSheet.columns = [
    { width: 25 },
    { width: 35 },
    { width: 15 },
    { width: 50 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
    { width: 40 },
  ];

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
