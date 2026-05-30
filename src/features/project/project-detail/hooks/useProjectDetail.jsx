import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { getEmployees, getProject } from "@/utils/api";
import { stripLegacyProjectFields } from "@/features/project";
import { buildMemberEmployees } from "../helpers/projectMemberHelpers.js";
import { canManageProjectTasks } from "../helpers/taskHelpers.js";
import { useProjectChat } from "./useProjectChat.js";
import { useProjectFiles } from "./useProjectFiles.js";
import { useProjectMembers } from "./useProjectMembers.jsx";
import { useProjectProgress } from "./useProjectProgress.js";
import { useProjectSave } from "./useProjectSave.js";
import { useProjectTasks } from "./useProjectTasks.js";

const EMPTY_OVERVIEW_DRAFT = {
  name: "",
  status: "active",
  deadline: "",
  managerName: "",
  siteName: "",
  code: "",
  formNo: "",
  desc: "",
};

export function useProjectDetail(id, user) {
  const isAdmin = user?.role === "admin";
  const isPM = user?.role === "PM";

  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewDraft, setOverviewDraft] = useState(EMPTY_OVERVIEW_DRAFT);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);
      setProject(null);

      try {
        const [projectData, emps] = await Promise.all([
          getProject(id),
          getEmployees({ all: true }),
        ]);
        if (cancelled) return;
        setProject(stripLegacyProjectFields(projectData));
        setEmployees(emps);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error.message || "Không tải được dự án");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const members = project?.members ?? [];
  const isProjectMember = members.some((member) => member.employeeId === user?.employeeId);
  const canManageTasks = project
    ? canManageProjectTasks({
        isAdmin,
        isPM,
        isProjectMember,
        project,
        employeeId: user?.employeeId,
      })
    : false;
  const memberEmployees = project ? buildMemberEmployees(members, employees, user) : [];
  const currentEmployee = employees.find((item) => item._id === user?.employeeId);
  const currentChatAuthor = isAdmin
    ? user?.username || "admin"
    : currentEmployee?.name || user?.username || "Nhân viên";

  const { saveProject } = useProjectSave({ projectId: id, setProject, setSaving });
  const fileModel = useProjectFiles({ projectId: id, project, setProject, setSaving });
  const progressModel = useProjectProgress({ project, saveProject });
  const memberModel = useProjectMembers({
    project,
    employees,
    isAdmin,
    saving,
    saveProject,
  });
  const chatModel = useProjectChat({ project, saveProject, currentChatAuthor });
  const taskModel = useProjectTasks({
    projectId: id,
    project,
    setProject,
    setSaving,
    userEmployeeId: user?.employeeId,
    canManageTasks,
    memberEmployees,
  });

  if (loading) {
    return { loading: true, project: null, loadError: null };
  }

  if (loadError || !project) {
    return { loading: false, project: null, loadError: loadError || "Không tìm thấy dự án" };
  }

  const activityLogs = [...(project.activityLogs ?? [])].reverse();

  const findEmployeeByActorName = (actorName) => {
    if (!actorName) return null;
    return employees.find((employee) => employee.name === actorName) ?? null;
  };

  const openOverviewEditor = () => {
    const deadlineValue = project.deadline ? dayjs(project.deadline) : null;

    setOverviewDraft({
      name: project.name,
      status: project.status,
      deadline: deadlineValue?.isValid() ? deadlineValue.format("YYYY-MM-DD") : "",
      managerName: project.managerName ?? "",
      siteName: project.siteName,
      code: project.code,
      formNo: project.formNo,
      desc: project.desc,
    });
    setOverviewOpen(true);
  };

  const submitOverviewUpdate = async () => {
    const updated = await saveProject({ ...overviewDraft }, "Cập nhật thông tin dự án thành công");
    if (updated) {
      setOverviewOpen(false);
    }
  };

  return {
    loading: false,
    isAdmin,
    project,
    saving,
    overviewOpen,
    setOverviewOpen,
    overviewDraft,
    setOverviewDraft,
    memberEmployees,
    currentChatAuthor,
    activityLogs,
    findEmployeeByActorName,
    canManageTasks,
    submitOverviewUpdate,
    openOverviewEditor,
    id,
    employees,
    userEmployeeId: user?.employeeId,
    saveProject,
    ...fileModel,
    ...progressModel,
    ...memberModel,
    ...chatModel,
    ...taskModel,
  };
}
