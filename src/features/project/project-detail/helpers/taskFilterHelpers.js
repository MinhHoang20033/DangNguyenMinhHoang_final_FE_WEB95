import dayjs from "dayjs";

import { getTaskStatus } from "./taskHelpers.js";

export const TASK_STATUS_FILTER = {
  ALL: "all",
  PENDING: "pending",
  COMPLETED: "completed",
  OVERDUE: "overdue",
};

export const TASK_DEADLINE_FILTER = {
  ALL: "all",
  OVERDUE: "overdue",
  TODAY: "today",
  NEXT_7_DAYS: "next7",
  NO_DEADLINE: "none",
};

export const TASK_STATUS_FILTER_OPTIONS = [
  { value: TASK_STATUS_FILTER.ALL, label: "Tất cả trạng thái" },
  { value: TASK_STATUS_FILTER.PENDING, label: "Chưa hoàn thành" },
  { value: TASK_STATUS_FILTER.COMPLETED, label: "Đã hoàn thành" },
  { value: TASK_STATUS_FILTER.OVERDUE, label: "Trễ hạn" },
];

export const TASK_DEADLINE_FILTER_OPTIONS = [
  { value: TASK_DEADLINE_FILTER.ALL, label: "Tất cả deadline" },
  { value: TASK_DEADLINE_FILTER.OVERDUE, label: "Đã quá hạn" },
  { value: TASK_DEADLINE_FILTER.TODAY, label: "Hôm nay" },
  { value: TASK_DEADLINE_FILTER.NEXT_7_DAYS, label: "7 ngày tới" },
  { value: TASK_DEADLINE_FILTER.NO_DEADLINE, label: "Chưa đặt deadline" },
];

export const EMPTY_TASK_FILTERS = {
  keyword: "",
  status: TASK_STATUS_FILTER.ALL,
  assigneeId: "all",
  deadline: TASK_DEADLINE_FILTER.ALL,
};

const matchesKeyword = (task, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return true;
  }

  const haystack = `${task.title ?? ""} ${task.description ?? ""}`.toLowerCase();
  return haystack.includes(normalizedKeyword);
};

const matchesStatus = (task, status) => {
  if (status === TASK_STATUS_FILTER.ALL) {
    return true;
  }

  if (status === TASK_STATUS_FILTER.PENDING) {
    return !task.completed;
  }

  if (status === TASK_STATUS_FILTER.COMPLETED) {
    return Boolean(task.completed);
  }

  if (status === TASK_STATUS_FILTER.OVERDUE) {
    return !task.completed && getTaskStatus(task).label === "Trễ hạn";
  }

  return true;
};

const matchesAssignee = (task, assigneeId) => {
  if (!assigneeId || assigneeId === "all") {
    return true;
  }

  return (task.assigneeIds ?? []).includes(assigneeId);
};

const matchesDeadline = (task, deadlineFilter) => {
  if (deadlineFilter === TASK_DEADLINE_FILTER.ALL) {
    return true;
  }

  const taskDeadline = task.deadline ? dayjs(task.deadline) : null;
  const today = dayjs().startOf("day");

  if (deadlineFilter === TASK_DEADLINE_FILTER.NO_DEADLINE) {
    return !taskDeadline?.isValid();
  }

  if (!taskDeadline?.isValid()) {
    return false;
  }

  const deadlineDay = taskDeadline.startOf("day");

  if (deadlineFilter === TASK_DEADLINE_FILTER.OVERDUE) {
    return !task.completed && deadlineDay.isBefore(today);
  }

  if (deadlineFilter === TASK_DEADLINE_FILTER.TODAY) {
    return deadlineDay.isSame(today, "day");
  }

  if (deadlineFilter === TASK_DEADLINE_FILTER.NEXT_7_DAYS) {
    const daysLeft = deadlineDay.diff(today, "day");
    return daysLeft >= 0 && daysLeft <= 7;
  }

  return true;
};

export const filterTasks = (tasks, filters) =>
  tasks.filter(
    (task) =>
      matchesKeyword(task, filters.keyword) &&
      matchesStatus(task, filters.status) &&
      matchesAssignee(task, filters.assigneeId) &&
      matchesDeadline(task, filters.deadline),
  );

export const hasActiveTaskFilters = (filters) =>
  Boolean(filters.keyword.trim()) ||
  filters.status !== TASK_STATUS_FILTER.ALL ||
  filters.assigneeId !== "all" ||
  filters.deadline !== TASK_DEADLINE_FILTER.ALL;
