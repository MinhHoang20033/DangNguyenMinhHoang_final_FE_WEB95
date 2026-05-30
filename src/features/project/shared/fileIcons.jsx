import { FileExcelOutlined, FilePdfOutlined, FileWordOutlined, PaperClipOutlined } from "@ant-design/icons";

export const getFileIcon = (file = {}) => {
  const extension = file.extension?.toLowerCase() || "";

  if (extension === ".pdf") return <FilePdfOutlined style={{ color: "#dc2626" }} />;
  if ([".xls", ".xlsx", ".csv"].includes(extension)) {
    return <FileExcelOutlined style={{ color: "#15803d" }} />;
  }
  if ([".doc", ".docx"].includes(extension)) {
    return <FileWordOutlined style={{ color: "#2563eb" }} />;
  }
  return <PaperClipOutlined />;
};
