import * as XLSX from "xlsx";
import { getProjectStatusPresentation } from "../shared/projectStatus.js";

const DEFAULT_WIDTHS = {
  narrow: 8,
  medium: 18,
  wide: 28,
  xwide: 40,
};

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;
const INVALID_SHEET_CHARS = /[:\\/?*[\]]/g;
const stripControlChars = (value) =>
  value
    .split("")
    .filter((char) => char.charCodeAt(0) > 31)
    .join("");

const sanitizeFileName = (value) =>
  stripControlChars(value || "chi-tiet-du-an")
    .replace(INVALID_FILENAME_CHARS, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

const sanitizeSheetName = (value, fallback = "Sheet") =>
  (value || fallback).replace(INVALID_SHEET_CHARS, "").slice(0, 31) || fallback;

const toDisplayValue = (value) => (value == null ? "" : String(value));

const countWrappedLines = (value, width) => {
  const text = toDisplayValue(value);
  if (!text) return 1;

  return text.split("\n").reduce((total, line) => {
    const lineLength = Math.max(1, line.length);
    return total + Math.max(1, Math.ceil(lineLength / Math.max(1, width)));
  }, 0);
};

const applySheetFormatting = (sheet, rows, minWidths = []) => {
  const columnCount = Math.max(0, ...rows.map((row) => row.length));

  sheet["!cols"] = Array.from({ length: columnCount }, (_, colIndex) => {
    const contentWidth = rows.reduce((maxWidth, row) => {
      const value = toDisplayValue(row[colIndex]);
      const longestLine = value
        .split("\n")
        .reduce((maxLine, line) => Math.max(maxLine, line.length), 0);

      return Math.max(maxWidth, longestLine + 2);
    }, 0);

    return {
      wch: Math.min(45, Math.max(minWidths[colIndex] ?? DEFAULT_WIDTHS.medium, contentWidth)),
    };
  });

  sheet["!rows"] = rows.map((row) => {
    const lineCount = row.reduce((maxLines, cell, colIndex) => {
      const width = sheet["!cols"]?.[colIndex]?.wch ?? DEFAULT_WIDTHS.medium;
      return Math.max(maxLines, countWrappedLines(cell, width));
    }, 1);

    return { hpt: Math.max(20, lineCount * 16) };
  });

  for (const cellAddress of Object.keys(sheet)) {
    if (cellAddress.startsWith("!")) continue;

    sheet[cellAddress].s = {
      alignment: {
        vertical: "top",
        wrapText: true,
      },
    };
  }
};

const buildOverviewRows = (project, memberEmployees = []) => {
  const rows = [
    ["Tổng quan dự án"],
    [],
    ["Tên dự án", project.name ?? ""],
    ["Quản lý dự án", project.managerName ?? ""],
    ["Công trình", project.siteName ?? ""],
    ["Mã số", project.code ?? ""],
    ["Ngày", project.date ?? ""],
    ["Biểu mẫu", project.formNo ?? ""],
    ["Trạng thái", getProjectStatusPresentation(project).label],
    ["Mô tả", project.desc ?? ""],
    [],
    ["Phân công nhân sự"],
    [],
    ["STT", "Tên", "Vai trò", "Email", "Số điện thoại", "Công việc được giao"],
    ...memberEmployees.map((member, index) => {
      const assignedTaskNames = (project.tasks ?? [])
        .filter((task) => (task.assigneeIds ?? []).includes(member._id))
        .map((task) => task.title)
        .filter(Boolean);

      return [
        index + 1,
        member.name ?? "",
        member.role ?? "",
        member.email ?? "",
        member.phone ?? "",
        assignedTaskNames.join("\n"),
      ];
    }),
  ];

  return rows;
};

/** Sheet «Tiến độ» — đọc trực tiếp `progressChecks` đã lưu trên DB. */
const buildProgressRows = (project) => {
  const section = project?.progressChecks ?? {};
  const columns = Array.isArray(section.columns) ? section.columns : [];
  const rows = Array.isArray(section.rows) ? section.rows : [];
  const headerRow = ["STT", ...columns.map((column) => column.name || "Cột")];

  return [
    [section.title || "Tiến độ dự án"],
    ...(section.subtitle ? [[section.subtitle]] : []),
    [],
    ["Tên dự án", project.name ?? ""],
    ["Công trình", project.siteName ?? ""],
    ["Mã số", project.code ?? ""],
    [],
    headerRow,
    ...rows.map((row, index) => [
      index + 1,
      ...columns.map((column) => row.values?.[column.id] ?? ""),
    ]),
  ];
};

export const exportProjectToExcel = (projectInput, memberEmployees = []) => {
  const project = projectInput ?? {};
  const workbook = XLSX.utils.book_new();

  const overviewRows = buildOverviewRows(project, memberEmployees);
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewRows);
  applySheetFormatting(overviewSheet, overviewRows, [
    DEFAULT_WIDTHS.narrow,
    DEFAULT_WIDTHS.xwide,
    22,
    18,
    28,
    18,
    DEFAULT_WIDTHS.wide,
  ]);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, sanitizeSheetName("Tổng quan dự án"));

  const progressRows = buildProgressRows(project);
  const progressSheet = XLSX.utils.aoa_to_sheet(progressRows);
  applySheetFormatting(progressSheet, progressRows, [
    DEFAULT_WIDTHS.narrow,
    ...Array.from({ length: 24 }, () => DEFAULT_WIDTHS.wide),
  ]);
  XLSX.utils.book_append_sheet(workbook, progressSheet, sanitizeSheetName("Tiến độ"));

  XLSX.writeFileXLSX(workbook, `${sanitizeFileName(project.name)}.xlsx`);
};
