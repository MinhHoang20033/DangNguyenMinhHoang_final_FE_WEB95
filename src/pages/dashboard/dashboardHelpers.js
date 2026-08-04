import dayjs from "dayjs";

import { getProjectStatusPresentation, isProjectOverdue } from "@/features/project";

export const ROLE_LABELS = {
  admin: "Quản trị viên",
  PM: "Quản lý dự án",
  employee: "Nhân viên",
};

export const getProjectCreatedAt = (project) => {
  const objectIdPrefix = project?._id?.toString?.().slice(0, 8);
  if (!objectIdPrefix) return 0;

  return parseInt(objectIdPrefix, 16) * 1000;
};

export const getTaskProgress = (project) => {
  const totalTasks = project.tasks?.length ?? 0;
  const completedTasks = (project.tasks ?? []).filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { totalTasks, completedTasks, pendingTasks, percent };
};

export const getProgressStrokeColor = (project) => {
  const { tagColor } = getProjectStatusPresentation(project);
  if (tagColor === "red") return "#dc2626";
  if (tagColor === "default") return "#16a34a";
  return "#2563eb";
};

export const getGreeting = () => {
  const hour = dayjs().hour();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

export const getDeadlineDayjs = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const computeDashboardData = (projects, employees) => {
  const completedProjects = projects.filter((project) => project.status !== "active");
  const overdueProjects = projects.filter(
    (project) => project.status === "active" && isProjectOverdue(project),
  );
  const inProgressProjects = projects.filter(
    (project) => project.status === "active" && !isProjectOverdue(project),
  );

  const allTasks = projects.flatMap((project) => project.tasks ?? []);
  const pendingTasks = allTasks.filter((task) => !task.completed).length;
  const completedTasks = allTasks.length - pendingTasks;
  const taskCompletionRate = allTasks.length
    ? Math.round((completedTasks / allTasks.length) * 100)
    : 0;

  const today = dayjs().startOf("day");
  const upcomingDeadlineProjects = inProgressProjects
    .filter((project) => {
      const deadline = getDeadlineDayjs(project.deadline);
      if (!deadline) return false;
      const daysLeft = deadline.startOf("day").diff(today, "day");
      return daysLeft >= 0 && daysLeft <= 7;
    })
    .sort(
      (left, right) =>
        getDeadlineDayjs(left.deadline).valueOf() - getDeadlineDayjs(right.deadline).valueOf(),
    );

  const recentProjects = [...projects]
    .sort((left, right) => getProjectCreatedAt(right) - getProjectCreatedAt(left))
    .slice(0, 6);

  const projectsByTasks = [...projects]
    .sort((left, right) => (right.tasks?.length ?? 0) - (left.tasks?.length ?? 0))
    .map((project) => ({
      ...project,
      progress: getTaskProgress(project),
    }));

  const projectsByMembers = [...projects].sort(
    (left, right) => (right.members?.length ?? 0) - (left.members?.length ?? 0),
  );

  const memberTaskMap = employees.reduce((accumulator, employee) => {
    accumulator[employee._id] = {
      employee,
      total: 0,
      pending: 0,
      projectNames: new Set(),
    };
    return accumulator;
  }, {});

  projects.forEach((project) => {
    (project.members ?? []).forEach((member) => {
      if (memberTaskMap[member.employeeId]) {
        memberTaskMap[member.employeeId].projectNames.add(
          project.name || "Dự án chưa đặt tên",
        );
      }
    });

    (project.tasks ?? []).forEach((task) => {
      (task.assigneeIds ?? []).forEach((employeeId) => {
        if (memberTaskMap[employeeId]) {
          memberTaskMap[employeeId].total += 1;
          if (!task.completed) {
            memberTaskMap[employeeId].pending += 1;
          }
        }
      });
    });
  });

  const topEmployeesByTasks = Object.values(memberTaskMap)
    .filter((item) => item.total > 0)
    .sort((left, right) => right.pending - left.pending || right.total - left.total)
    .slice(0, 5);

  const unassignedProjectMembers = Object.values(memberTaskMap)
    .filter((item) => item.projectNames.size > 0 && item.total === 0)
    .sort((left, right) =>
      (left.employee.name || "").localeCompare(right.employee.name || "", "vi"),
    );

  return {
    totalProjects: projects.length,
    inProgressProjects,
    overdueProjects,
    completedProjects,
    pendingTasks,
    completedTasks,
    totalTasks: allTasks.length,
    taskCompletionRate,
    upcomingDeadlineProjects,
    recentProjects,
    projectsByTasks,
    projectsByMembers,
    topEmployeesByTasks,
    unassignedProjectMembers,
    statusCounts: {
      inProgress: inProgressProjects.length,
      overdue: overdueProjects.length,
      completed: completedProjects.length,
    },
  };
};
