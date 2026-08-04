import dayjs from "dayjs";

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

export const getProjectStatusPresentation = (project) => {
  if (project.status !== "active") {
    return { label: "Đã hoàn thành", tagColor: "default", bannerLabel: "Dự án đã hoàn thành" };
  }
  if (isProjectOverdue(project)) {
    return { label: "Trễ hạn", tagColor: "red", bannerLabel: "Dự án trễ hạn" };
  }
  return { label: "Đang triển khai", tagColor: "green", bannerLabel: "Dự án đang triển khai" };
};

export const getProjectOverviewStatus = (project) => {
  const { label, tagColor } = getProjectStatusPresentation(project);
  return { label, tagColor };
};

