export const formatDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileTypeLabel = (file = {}) => {
  const extension = file.extension?.toLowerCase() || "";

  if (extension === ".pdf") return "PDF";
  if ([".xls", ".xlsx", ".csv"].includes(extension)) return "Excel";
  if ([".doc", ".docx"].includes(extension)) return "Word";
  return "Tệp";
};
