
export const EMPTY_VALUE = "-";
export const EXCEL_PREVIEW_HEIGHT = 560;
export const EXCEL_ROW_HEIGHT = 38;
export const EXCEL_COLUMN_WIDTH = 180;

export const TASK_EXCEL_EXTENSIONS = [".xls", ".xlsx", ".csv"];
export const TASK_EXCEL_ACCEPT = TASK_EXCEL_EXTENSIONS.join(",");

export const FILE_BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

/** Absolute Cloudinary/Supabase URLs pass through; legacy /uploads paths use API host */
export const resolveFileUrl = (url = "") => {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${FILE_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};
