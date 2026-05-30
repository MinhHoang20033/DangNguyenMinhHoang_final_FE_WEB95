import dayjs from "dayjs";

/** Bỏ field cũ không còn trên schema — dữ liệu còn lại giữ nguyên từ API/DB. */
export const stripLegacyProjectFields = (project) => {
  if (!project) return project;
  const { processControls: _processControls, materialControls: _materialControls, ...rest } = project;
  return rest;
};

const getDeadlineDayjs = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const isProjectOverdue = (project) => {
  if (project.status !== "active") return false;
  const deadline = getDeadlineDayjs(project.deadline);
  if (!deadline) return false;
  return deadline.isBefore(dayjs(), "day");
};

/** Nhãn trạng thái hiển thị trên tổng quan / thẻ dự án */
export const getProjectStatusPresentation = (project) => {
  if (project.status !== "active") {
    return { label: "Đã hoàn thành", tagColor: "default", bannerLabel: "Dự án đã hoàn thành" };
  }
  if (isProjectOverdue(project)) {
    return { label: "Trễ hạn", tagColor: "red", bannerLabel: "Dự án trễ hạn" };
  }
  return { label: "Đang triển khai", tagColor: "green", bannerLabel: "Dự án đang triển khai" };
};

/** Trạng thái trên màn chi tiết dự án — đồng bộ với danh sách dự án */
export const getProjectOverviewStatus = (project) => {
  const { label, tagColor } = getProjectStatusPresentation(project);
  return { label, tagColor };
};
