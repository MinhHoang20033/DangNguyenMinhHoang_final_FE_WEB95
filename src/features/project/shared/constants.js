/** UI / preview defaults for project detail & exports */
export const EMPTY_VALUE = "-";
export const EMPLOYEE_BATCH_SIZE = 10;
export const EXCEL_PREVIEW_HEIGHT = 560;
export const EXCEL_ROW_HEIGHT = 38;
export const EXCEL_COLUMN_WIDTH = 180;

/** Định dạng Excel cho task (đính kèm / gửi lại) */
export const TASK_EXCEL_EXTENSIONS = [".xls", ".xlsx", ".csv"];
export const TASK_EXCEL_ACCEPT = TASK_EXCEL_EXTENSIONS.join(",");

/** Origin for uploads — same host as API, without /api suffix */
export const FILE_BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
