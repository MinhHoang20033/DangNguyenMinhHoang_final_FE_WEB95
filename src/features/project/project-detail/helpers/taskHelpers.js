import { TASK_EXCEL_EXTENSIONS } from "../../shared/constants.js";

const normalizeEmployeeId = (id) => (id == null ? "" : String(id));

export const isTaskExcelFile = (file) =>
  TASK_EXCEL_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));

export const filterTaskExcelFiles = (files = []) => files.filter(isTaskExcelFile);

export const warnInvalidTaskExcelSelection = (selectedFiles, validFiles, messageApi) => {
  if (!selectedFiles.length) {
    return;
  }
  if (!validFiles.length) {
    messageApi.warning("Chỉ chấp nhận tệp Excel (.xls, .xlsx, .csv)");
    return;
  }
  if (validFiles.length < selectedFiles.length) {
    messageApi.warning("Một số tệp bị bỏ qua vì không phải định dạng Excel");
  }
};

export const isProjectManager = (project, employeeId) => {
  const id = normalizeEmployeeId(employeeId);
  if (!id) {
    return false;
  }
  return normalizeEmployeeId(project?.managerId) === id;
};

/** Admin, PM (thành viên dự án), hoặc quản lý dự án (managerId) */
export const canManageProjectTasks = ({ isAdmin, isPM, isProjectMember, project, employeeId }) =>
  Boolean(isAdmin) ||
  (Boolean(isPM) && Boolean(isProjectMember)) ||
  isProjectManager(project, employeeId);

/** Nhân viên thường chỉ thấy task được giao; quản lý thấy toàn bộ */
export const filterVisibleTasks = (tasks = [], employeeId, canManageTasks) =>
  canManageTasks ? tasks : tasks.filter((task) => isTaskAssignee(task, employeeId));

export const isTaskAssignee = (task, employeeId) => {
  const id = normalizeEmployeeId(employeeId);
  if (!id) {
    return false;
  }
  return (task?.assigneeIds ?? []).map(normalizeEmployeeId).includes(id);
};

export const canDeleteTaskSubmissionFile = (task, file, employeeId, canManageTasks) => {
  if (canManageTasks) {
    return true;
  }
  const id = normalizeEmployeeId(employeeId);
  if (!id || !isTaskAssignee(task, id)) {
    return false;
  }
  const uploadedBy = normalizeEmployeeId(file?.uploadedBy);
  if (!uploadedBy) {
    return false;
  }
  return uploadedBy === id;
};

export const getTaskStatus = (task) => {
  if (task.completed) {
    return { label: "Hoàn thành", color: "green" };
  }

  if (!task.deadline) {
    return { label: "Đang làm", color: "blue" };
  }

  const deadlineDate = new Date(task.deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return { label: "Đang làm", color: "blue" };
  }

  deadlineDate.setHours(23, 59, 59, 999);
  if (Date.now() > deadlineDate.getTime()) {
    return { label: "Trễ hạn", color: "red" };
  }

  return { label: "Đang làm", color: "blue" };
};

export const sortTasksByCompletion = (tasks = []) =>
  [...tasks].sort((leftTask, rightTask) => {
    if (leftTask.completed === rightTask.completed) {
      return 0;
    }
    return leftTask.completed ? 1 : -1;
  });
