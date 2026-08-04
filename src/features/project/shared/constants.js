
export const EMPTY_VALUE = "-";
export const EXCEL_PREVIEW_HEIGHT = 560;
export const EXCEL_ROW_HEIGHT = 38;
export const EXCEL_COLUMN_WIDTH = 180;

export const TASK_EXCEL_EXTENSIONS = [".xls", ".xlsx", ".csv"];
export const TASK_EXCEL_ACCEPT = TASK_EXCEL_EXTENSIONS.join(",");

export const FILE_BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
