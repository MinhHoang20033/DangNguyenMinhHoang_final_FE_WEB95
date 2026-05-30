export const PROGRESS_DEFAULT_SUBTITLE = "Kế hoạch và báo cáo tiến độ thi công dự án";
export const PROGRESS_DEFAULT_TITLE = "Tiến độ dự án";
export const PROGRESS_DEFAULT_COLUMNS = [
  "Tên nhân viên",
  "Công việc được giao",
  "Ngày bắt đầu",
  "Ngày hoàn thành",
  "Kết quả thực hiện",
];

export const newProgressColumn = (name = "") => ({
  id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
});

export const newProgressRow = (columns = []) => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  values: columns.reduce((acc, column) => {
    acc[column.id] = "";
    return acc;
  }, {}),
});

export const getProgressFromProject = (project) => {
  const raw = project?.progressChecks;
  if (!raw || typeof raw !== "object") {
    return { title: "", subtitle: "", columns: [], rows: [] };
  }

  return {
    title: raw.title ?? "",
    subtitle: raw.subtitle ?? "",
    columns: Array.isArray(raw.columns) ? raw.columns : [],
    rows: Array.isArray(raw.rows) ? raw.rows : [],
  };
};
