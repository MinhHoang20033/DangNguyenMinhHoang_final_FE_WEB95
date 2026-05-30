import { useRef, useState } from "react";
import { message } from "antd";
import * as XLSX from "xlsx";

import { deleteProjectFile, uploadProjectFiles } from "@/utils/api";
import { createEmptyPreviewState, FILE_BASE_URL, stripLegacyProjectFields } from "@/features/project";

export function useProjectFiles({ projectId, project, setProject, setSaving }) {
  const [previewState, setPreviewState] = useState(createEmptyPreviewState);
  const fileInputRef = useRef(null);

  const relatedFiles = project?.relatedFiles ?? [];
  const activeExcelRows =
    previewState.type === "excel" && previewState.activeSheetName
      ? previewState.rows[previewState.activeSheetName] ?? []
      : [];

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProjectFileUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setSaving(true);

    try {
      const updatedProject = await uploadProjectFiles(projectId, formData);
      setProject(stripLegacyProjectFields(updatedProject));
      message.success("Tải tệp lên thành công");
    } catch (error) {
      message.error(error.message || "Không thể tải tệp lên");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const handleDownloadFile = async (file) => {
    const fileName = file.name || file.originalName || "tep-du-an";
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${FILE_BASE_URL}${file.url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Không thể tải tệp");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      message.error(error.message || "Không thể tải tệp");
    }
  };

  const closePreview = () => {
    setPreviewState(createEmptyPreviewState());
  };

  const handleExcelSheetChange = (sheetName) => {
    const nextRows = previewState.rows[sheetName] ?? [];
    const nextColumnCount = nextRows.reduce(
      (maxCount, row) => Math.max(maxCount, Array.isArray(row) ? row.length : 0),
      0,
    );

    setPreviewState((current) => ({
      ...current,
      sheetName,
      activeSheetName: sheetName,
      columnCount: Math.max(nextColumnCount, 1),
    }));
  };

  const handleDeleteProjectFile = async (fileId) => {
    setSaving(true);

    try {
      const updatedProject = await deleteProjectFile(projectId, fileId);
      setProject(stripLegacyProjectFields(updatedProject));
      message.success("Đã xóa tệp liên quan");
    } catch (error) {
      message.error(error.message || "Không thể xóa tệp liên quan");
    } finally {
      setSaving(false);
    }
  };

  const openFilePreview = async (file) => {
    const extension = file.extension?.toLowerCase() || "";
    const fileUrl = `${FILE_BASE_URL}${file.url}`;

    setPreviewState({
      open: true,
      file,
      type: extension === ".pdf" ? "pdf" : "loading",
      loading: extension !== ".pdf",
      error: "",
      rows: [],
      sheetName: "",
      sheetNames: [],
      activeSheetName: "",
      columnCount: 0,
      html: "",
    });

    if (extension === ".pdf") {
      return;
    }

    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();

      if ([".xls", ".xlsx", ".csv"].includes(extension)) {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetRows = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          sheetRows[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
        });

        const firstSheetName = workbook.SheetNames[0];
        const firstSheetRows = sheetRows[firstSheetName] ?? [];
        const columnCount = firstSheetRows.reduce(
          (maxCount, row) => Math.max(maxCount, Array.isArray(row) ? row.length : 0),
          0,
        );

        setPreviewState({
          open: true,
          file,
          type: "excel",
          loading: false,
          error: "",
          rows: sheetRows,
          sheetName: firstSheetName,
          sheetNames: workbook.SheetNames,
          activeSheetName: firstSheetName,
          columnCount: Math.max(columnCount, 1),
          html: "",
        });
        return;
      }

      if (extension === ".docx") {
        const mammoth = await import("mammoth/mammoth.browser");
        const result = await mammoth.convertToHtml({ arrayBuffer });

        setPreviewState({
          open: true,
          file,
          type: "word",
          loading: false,
          error: "",
          rows: [],
          sheetName: "",
          sheetNames: [],
          activeSheetName: "",
          columnCount: 0,
          html: result.value,
        });
        return;
      }

      setPreviewState({
        open: true,
        file,
        type: "unsupported",
        loading: false,
        error: "Định dạng này chưa hỗ trợ xem trước trực tiếp.",
        rows: [],
        sheetName: "",
        sheetNames: [],
        activeSheetName: "",
        columnCount: 0,
        html: "",
      });
    } catch (error) {
      setPreviewState({
        open: true,
        file,
        type: "error",
        loading: false,
        error: error.message || "Không thể xem trước tệp này.",
        rows: [],
        sheetName: "",
        sheetNames: [],
        activeSheetName: "",
        columnCount: 0,
        html: "",
      });
    }
  };

  return {
    previewState,
    setPreviewState,
    fileInputRef,
    relatedFiles,
    activeExcelRows,
    triggerFilePicker,
    handleProjectFileUpload,
    handleDownloadFile,
    handleDeleteProjectFile,
    openFilePreview,
    closePreview,
    handleExcelSheetChange,
  };
}
