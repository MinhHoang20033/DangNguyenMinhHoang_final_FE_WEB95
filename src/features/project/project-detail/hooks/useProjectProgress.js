import { useState } from "react";
import { message } from "antd";

import {
  getProgressFromProject,
  newProgressColumn,
  newProgressRow,
  PROGRESS_DEFAULT_COLUMNS,
  PROGRESS_DEFAULT_SUBTITLE,
  PROGRESS_DEFAULT_TITLE,
} from "../helpers/projectProgressHelpers.js";

export function useProjectProgress({ project, saveProject }) {
  const [progressRowEditor, setProgressRowEditor] = useState({
    open: false,
    rowId: null,
    draftValues: {},
  });
  const [progressConfigEditor, setProgressConfigEditor] = useState({
    open: false,
    subtitle: "",
    columns: [],
  });

  const progressSection = getProgressFromProject(project);
  const hasProgressColumns = (progressSection.columns?.length ?? 0) > 0;

  const updateProgressSection = (nextSection, successMessage) =>
    saveProject({ progressChecks: nextSection }, successMessage);

  const openProgressRowEditor = (rowId = null) => {
    const currentRow = rowId
      ? progressSection.rows.find((row) => row.id === rowId)
      : newProgressRow(progressSection.columns);

    setProgressRowEditor({
      open: true,
      rowId,
      draftValues: { ...(currentRow?.values ?? {}) },
    });
  };

  const submitProgressRowUpdate = async () => {
    const { rowId, draftValues } = progressRowEditor;

    const nextRows = rowId
      ? progressSection.rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                values: draftValues,
              }
            : row,
        )
      : [
          ...progressSection.rows,
          {
            id: `row-${Date.now()}`,
            values: progressSection.columns.reduce((acc, column) => {
              acc[column.id] = draftValues[column.id] ?? "";
              return acc;
            }, {}),
          },
        ];

    const updated = await updateProgressSection(
      {
        ...progressSection,
        rows: nextRows,
      },
      rowId ? "Cập nhật dòng tiến độ thành công" : "Đã thêm dòng tiến độ",
    );

    if (!updated) {
      return;
    }

    setProgressRowEditor({
      open: false,
      rowId: null,
      draftValues: {},
    });
  };

  const removeProgressRow = async (rowId) => {
    await updateProgressSection(
      {
        ...progressSection,
        rows: progressSection.rows.filter((row) => row.id !== rowId),
      },
      "Đã xóa dòng tiến độ",
    );
  };

  const openProgressConfigEditor = () => {
    const defaultColumns = PROGRESS_DEFAULT_COLUMNS.map((columnName) =>
      newProgressColumn(columnName),
    );

    setProgressConfigEditor({
      open: true,
      subtitle: progressSection.subtitle || PROGRESS_DEFAULT_SUBTITLE,
      columns: progressSection.columns.length
        ? progressSection.columns.map((column) => ({ ...column }))
        : defaultColumns,
    });
  };

  const addProgressConfigColumn = () => {
    setProgressConfigEditor((current) => ({
      ...current,
      columns: [...current.columns, newProgressColumn(`Tham số ${current.columns.length + 1}`)],
    }));
  };

  const updateProgressConfigColumnName = (columnId, name) => {
    setProgressConfigEditor((current) => ({
      ...current,
      columns: current.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              name,
            }
          : column,
      ),
    }));
  };

  const removeProgressConfigColumn = (columnId) => {
    setProgressConfigEditor((current) => ({
      ...current,
      columns: current.columns.filter((column) => column.id !== columnId),
    }));
  };

  const submitProgressConfigUpdate = async () => {
    const { subtitle, columns } = progressConfigEditor;

    if (!columns.length) {
      message.warning("Vui lòng tạo ít nhất một tham số");
      return false;
    }

    if (columns.some((column) => !column.name.trim())) {
      message.warning("Vui lòng nhập tên cho tất cả tham số");
      return false;
    }

    const nextSection = {
      ...progressSection,
      title: progressSection.title || PROGRESS_DEFAULT_TITLE,
      subtitle: subtitle.trim() || progressSection.subtitle || PROGRESS_DEFAULT_SUBTITLE,
      columns: columns.map((column) => ({
        ...column,
        name: column.name.trim(),
      })),
      rows: progressSection.rows.map((row) => ({
        ...row,
        values: columns.reduce((acc, column) => {
          acc[column.id] = row.values?.[column.id] ?? "";
          return acc;
        }, {}),
      })),
    };

    const updated = await updateProgressSection(nextSection, "Đã lưu cấu hình tiến độ dự án");
    if (!updated) {
      return false;
    }

    setProgressConfigEditor({
      open: false,
      subtitle: "",
      columns: [],
    });
  };

  return {
    progressSection,
    hasProgressColumns,
    progressRowEditor,
    setProgressRowEditor,
    progressConfigEditor,
    setProgressConfigEditor,
    openProgressRowEditor,
    submitProgressRowUpdate,
    removeProgressRow,
    openProgressConfigEditor,
    addProgressConfigColumn,
    updateProgressConfigColumnName,
    removeProgressConfigColumn,
    submitProgressConfigUpdate,
  };
}
