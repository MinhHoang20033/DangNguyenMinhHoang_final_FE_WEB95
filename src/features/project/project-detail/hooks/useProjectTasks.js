import { useRef, useState } from "react";
import { message, Modal } from "antd";

import {
  deleteTaskFile,
  getProject,
  updateProject,
  uploadTaskFiles,
  uploadTaskSubmissionFiles,
} from "@/utils/api";
import {
  filterTaskExcelFiles,
  filterVisibleTasks,
  sortTasksByCompletion,
  warnInvalidTaskExcelSelection,
} from "../helpers/taskHelpers.js";
import { stripLegacyProjectFields } from "@/features/project";

const EMPTY_TASK_EDITOR = {
  open: false,
  taskId: null,
  title: "",
  description: "",
  deadline: "",
  assigneeIds: [],
  pendingFiles: [],
};

const EMPTY_SUBTASK_EDITOR = {
  open: false,
  parentTaskId: null,
  subtaskId: null,
  title: "",
  description: "",
};

export function useProjectTasks({
  projectId,
  project,
  setProject,
  setSaving,
  userEmployeeId,
  canManageTasks,
  memberEmployees,
}) {
  const [taskEditor, setTaskEditor] = useState(EMPTY_TASK_EDITOR);
  const [subtaskEditor, setSubtaskEditor] = useState(EMPTY_SUBTASK_EDITOR);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const taskUploadInputRefs = useRef({});

  const tasks = project?.tasks ?? [];
  const visibleTasks = filterVisibleTasks(tasks, userEmployeeId, canManageTasks);
  const sortedTasks = sortTasksByCompletion(visibleTasks);
  const projectMemberOptions = memberEmployees.map((member) => ({
    value: member._id,
    label: member.name || "Thành viên dự án",
  }));

  const getTaskAssignees = (task) =>
    (task?.assigneeIds ?? [])
      .map((employeeId) => memberEmployees.find((member) => member._id === employeeId))
      .filter(Boolean);

  const getTaskFiles = (taskId) => tasks.find((task) => task.id === taskId)?.files ?? [];

  const closeTaskEditor = () => setTaskEditor(EMPTY_TASK_EDITOR);
  const closeSubtaskEditor = () => setSubtaskEditor(EMPTY_SUBTASK_EDITOR);

  /** Refetch project rồi mới ghi tasks — giảm lost update khi nhiều người sửa */
  const saveTasksUpdate = async (buildNextTasks, successMessage) => {
    setSaving(true);

    try {
      const fresh = stripLegacyProjectFields(await getProject(projectId));
      const currentTasks = fresh.tasks ?? [];
      const nextTasks = buildNextTasks(currentTasks);
      const {
        activityLogs: _logs,
        updateHistory: _history,
        revision: _revision,
        ...projectPayload
      } = fresh;
      const updatedProject = await updateProject(projectId, { ...projectPayload, tasks: nextTasks });
      const normalized = stripLegacyProjectFields(updatedProject);
      setProject(normalized);
      if (successMessage) {
        message.success(successMessage);
      }
      return normalized;
    } catch (error) {
      message.error(error.message || "Không thể cập nhật công việc");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleTaskFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validFiles = filterTaskExcelFiles(selectedFiles);
    warnInvalidTaskExcelSelection(selectedFiles, validFiles, message);

    setTaskEditor((current) => ({
      ...current,
      pendingFiles: validFiles,
    }));
    event.target.value = "";
  };

  const triggerTaskFilePicker = (taskId) => {
    taskUploadInputRefs.current[taskId]?.click();
  };

  const handleTaskRowFileUpload = async (taskId, event) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      event.target.value = "";
      return;
    }

    const selectedFiles = Array.from(event.target.files ?? []);
    const validFiles = filterTaskExcelFiles(selectedFiles);
    warnInvalidTaskExcelSelection(selectedFiles, validFiles, message);

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    validFiles.forEach((file) => formData.append("files", file));

    setUploadingTaskId(taskId);

    try {
      const updatedProject = await uploadTaskSubmissionFiles(projectId, taskId, formData);
      setProject(stripLegacyProjectFields(updatedProject));
      message.success("Đã gửi lại tệp hoàn thành cho task");
    } catch (error) {
      message.error(error.message || "Không thể tải tệp cho task");
    } finally {
      setUploadingTaskId(null);
      event.target.value = "";
    }
  };

  const handleDeleteTaskFile = async (taskId, fileId, scope = "files") => {
    setSaving(true);

    try {
      const updatedProject = await deleteTaskFile(projectId, taskId, fileId, scope);
      setProject(stripLegacyProjectFields(updatedProject));
      message.success(scope === "submissionFiles" ? "Đã xóa file gửi lại" : "Đã xóa file task");
    } catch (error) {
      message.error(error.message || "Không thể xóa file task");
    } finally {
      setSaving(false);
    }
  };

  const openTaskEditor = (task = null) => {
    setTaskEditor({
      open: true,
      taskId: task?.id ?? null,
      title: task?.title ?? "",
      description: task?.description ?? "",
      deadline: task?.deadline ?? "",
      assigneeIds: task?.assigneeIds ?? [],
      pendingFiles: [],
    });
  };

  const submitTaskUpdate = async () => {
    if (!taskEditor.title.trim()) {
      message.warning("Vui lòng nhập tên công việc");
      return;
    }

    const isNewTask = !taskEditor.taskId;
    const nextTaskId =
      taskEditor.taskId || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pendingFiles = [...taskEditor.pendingFiles];
    const editorSnapshot = {
      taskId: taskEditor.taskId,
      title: taskEditor.title.trim(),
      description: taskEditor.description.trim(),
      deadline: taskEditor.deadline || "",
      assigneeIds: taskEditor.assigneeIds,
    };

    const updated = await saveTasksUpdate(
      (currentTasks) =>
        editorSnapshot.taskId
          ? currentTasks.map((task) =>
              task.id === editorSnapshot.taskId
                ? {
                    ...task,
                    title: editorSnapshot.title,
                    description: editorSnapshot.description,
                    deadline: editorSnapshot.deadline,
                    assigneeIds: editorSnapshot.assigneeIds,
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            )
          : [
              ...currentTasks,
              {
                id: nextTaskId,
                title: editorSnapshot.title,
                description: editorSnapshot.description,
                deadline: editorSnapshot.deadline,
                assigneeIds: editorSnapshot.assigneeIds,
                files: [],
                submissionFiles: [],
                subtasks: [],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
      isNewTask ? "Đã thêm công việc" : "Đã cập nhật công việc",
    );

    if (!updated) {
      return;
    }

    if (pendingFiles.length) {
      setSaving(true);
      try {
        const formData = new FormData();
        pendingFiles.forEach((file) => formData.append("files", file));
        const updatedProject = await uploadTaskFiles(projectId, nextTaskId, formData);
        setProject(stripLegacyProjectFields(updatedProject));
        message.success("Đã tải tệp Excel cho task");
      } catch (uploadError) {
        if (isNewTask) {
          const rolledBack = await saveTasksUpdate(
            (currentTasks) => currentTasks.filter((task) => task.id !== nextTaskId),
            null,
          );
          message.error(
            rolledBack
              ? uploadError.message || "Không thể tải tệp. Task chưa được tạo — vui lòng thử lại."
              : "Task đã tạo nhưng không tải được file. Vui lòng xóa task hoặc upload lại trong phần chỉnh sửa.",
          );
        } else {
          message.error(
            uploadError.message ||
              "Task đã lưu nhưng không tải được file. Vui lòng mở chỉnh sửa task và upload lại.",
          );
        }
        return;
      } finally {
        setSaving(false);
      }
    }

    closeTaskEditor();
  };

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    await saveTasksUpdate(
      (currentTasks) =>
        currentTasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                completed: !item.completed,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      "Đã cập nhật trạng thái công việc",
    );
  };

  const openSubtaskEditor = (parentTaskId, subtask = null) => {
    setSubtaskEditor({
      open: true,
      parentTaskId,
      subtaskId: subtask?.id ?? null,
      title: subtask?.title ?? "",
      description: subtask?.description ?? "",
    });
  };

  const submitSubtaskUpdate = async () => {
    if (!subtaskEditor.parentTaskId) {
      return;
    }

    if (!subtaskEditor.title.trim()) {
      message.warning("Vui lòng nhập tên task con");
      return;
    }

    const now = new Date().toISOString();
    const nextSubtaskId =
      subtaskEditor.subtaskId || `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const editorSnapshot = { ...subtaskEditor, nextSubtaskId, now };

    const updated = await saveTasksUpdate(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== editorSnapshot.parentTaskId) {
            return task;
          }

          const currentSubtasks = task.subtasks ?? [];
          const nextSubtasks = editorSnapshot.subtaskId
            ? currentSubtasks.map((subtask) =>
                subtask.id === editorSnapshot.subtaskId
                  ? {
                      ...subtask,
                      title: editorSnapshot.title.trim(),
                      description: editorSnapshot.description.trim(),
                      updatedAt: editorSnapshot.now,
                    }
                  : subtask,
              )
            : [
                ...currentSubtasks,
                {
                  id: editorSnapshot.nextSubtaskId,
                  title: editorSnapshot.title.trim(),
                  description: editorSnapshot.description.trim(),
                  completed: false,
                  createdAt: editorSnapshot.now,
                  updatedAt: editorSnapshot.now,
                },
              ];

          return {
            ...task,
            subtasks: nextSubtasks,
            updatedAt: editorSnapshot.now,
          };
        }),
      editorSnapshot.subtaskId ? "Đã cập nhật task con" : "Đã thêm task con",
    );

    if (!updated) {
      return;
    }

    closeSubtaskEditor();
  };

  const toggleSubtaskCompletion = async (parentTaskId, subtaskId) => {
    const parentTask = tasks.find((item) => item.id === parentTaskId);
    if (!parentTask) {
      return;
    }

    const now = new Date().toISOString();

    await saveTasksUpdate(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== parentTaskId) {
            return task;
          }

          return {
            ...task,
            subtasks: (task.subtasks ?? []).map((subtask) =>
              subtask.id === subtaskId
                ? {
                    ...subtask,
                    completed: !subtask.completed,
                    updatedAt: now,
                  }
                : subtask,
            ),
            updatedAt: now,
          };
        }),
      "Đã cập nhật trạng thái task con",
    );
  };

  const removeSubtask = async (parentTaskId, subtaskId) => {
    const now = new Date().toISOString();

    await saveTasksUpdate(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== parentTaskId) {
            return task;
          }

          return {
            ...task,
            subtasks: (task.subtasks ?? []).filter((subtask) => subtask.id !== subtaskId),
            updatedAt: now,
          };
        }),
      "Đã xóa task con",
    );
  };

  const removeTask = async (taskId) => {
    await saveTasksUpdate(
      (currentTasks) => currentTasks.filter((task) => task.id !== taskId),
      "Đã xóa công việc",
    );
  };

  const confirmRemoveTask = (taskId, taskTitle) => {
    Modal.confirm({
      title: "Xóa công việc",
      content: `Bạn có chắc muốn xóa task «${taskTitle || "này"}»? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => removeTask(taskId),
    });
  };

  const confirmRemoveSubtask = (parentTaskId, subtaskId, subtaskTitle) => {
    Modal.confirm({
      title: "Xóa task con",
      content: `Bạn có chắc muốn xóa task con «${subtaskTitle || "này"}»?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => removeSubtask(parentTaskId, subtaskId),
    });
  };

  return {
    taskEditor,
    setTaskEditor,
    subtaskEditor,
    setSubtaskEditor,
    taskUploadInputRefs,
    uploadingTaskId,
    sortedTasks,
    projectMemberOptions,
    getTaskAssignees,
    getTaskFiles,
    closeTaskEditor,
    closeSubtaskEditor,
    openTaskEditor,
    submitTaskUpdate,
    handleTaskFileSelection,
    triggerTaskFilePicker,
    handleTaskRowFileUpload,
    handleDeleteTaskFile,
    toggleTaskCompletion,
    openSubtaskEditor,
    submitSubtaskUpdate,
    toggleSubtaskCompletion,
    confirmRemoveSubtask,
    confirmRemoveTask,
  };
}
