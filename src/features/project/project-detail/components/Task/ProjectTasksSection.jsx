import { Button, Card, Empty, Table } from "antd";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import { SubtaskEditorModal } from "./SubtaskEditorModal.jsx";
import { TaskEditorModal } from "./TaskEditorModal.jsx";
import { buildTaskTableColumns } from "./taskTableColumns.jsx";

export function ProjectTasksSection() {
  const {
    sortedTasks,
    openTaskEditor,
    canManageTasks,
    taskEditor,
    setTaskEditor,
    submitTaskUpdate,
    saving,
    handleTaskFileSelection,
    getTaskFiles,
    openFilePreview,
    handleDownloadFile,
    projectMemberOptions,
    subtaskEditor,
    setSubtaskEditor,
    submitSubtaskUpdate,
    getTaskAssignees,
    handleDeleteTaskFile,
    userEmployeeId,
    taskUploadInputRefs,
    handleTaskRowFileUpload,
    triggerTaskFilePicker,
    openSubtaskEditor,
    toggleSubtaskCompletion,
    confirmRemoveSubtask,
    toggleTaskCompletion,
    confirmRemoveTask,
    closeTaskEditor,
    closeSubtaskEditor,
    uploadingTaskId,
  } = useProjectDetailModel();

  const taskColumns = buildTaskTableColumns({
    getTaskAssignees,
    openFilePreview,
    handleDownloadFile,
    handleDeleteTaskFile,
    canManageTasks,
    userEmployeeId,
    taskUploadInputRefs,
    handleTaskRowFileUpload,
    triggerTaskFilePicker,
    openSubtaskEditor,
    toggleSubtaskCompletion,
    confirmRemoveSubtask,
    openTaskEditor,
    toggleTaskCompletion,
    confirmRemoveTask,
    saving,
    uploadingTaskId,
  });

  const emptyDescription = canManageTasks
    ? "Chưa có task trong dự án"
    : "Bạn chưa được giao task nào trong dự án này";

  const existingTaskFiles =
    taskEditor.taskId && taskEditor.open ? getTaskFiles(taskEditor.taskId) : [];

  return (
    <>
      <Card
        title="Công việc dự án"
        extra={
          canManageTasks ? (
            <Button onClick={() => openTaskEditor()}>Thêm task</Button>
          ) : null
        }
      >
        {sortedTasks.length ? (
          <Table
            rowKey="id"
            columns={taskColumns}
            dataSource={sortedTasks}
            pagination={false}
            scroll={{ x: 1700, y: 420 }}
          />
        ) : (
          <Empty description={emptyDescription} />
        )}
      </Card>

      <TaskEditorModal
        taskEditor={taskEditor}
        saving={saving}
        projectMemberOptions={projectMemberOptions}
        onCancel={closeTaskEditor}
        onSubmit={submitTaskUpdate}
        onChange={(patch) => setTaskEditor((current) => ({ ...current, ...patch }))}
        onFileSelection={handleTaskFileSelection}
        existingFiles={existingTaskFiles}
        onPreviewFile={openFilePreview}
        onDownloadFile={handleDownloadFile}
      />

      <SubtaskEditorModal
        subtaskEditor={subtaskEditor}
        saving={saving}
        onCancel={closeSubtaskEditor}
        onSubmit={submitSubtaskUpdate}
        onChange={(patch) => setSubtaskEditor((current) => ({ ...current, ...patch }))}
      />
    </>
  );
}
