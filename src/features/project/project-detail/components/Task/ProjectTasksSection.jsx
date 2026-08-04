import { Button, Card, Empty, Grid, Typography } from "antd";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  SECTION_SCROLL,
  createScrollBoxStyle,
  sectionCardStyle,
  sectionCardStyles,
} from "../../helpers/sectionStyles.js";
import { SubtaskEditorModal } from "./SubtaskEditorModal.jsx";
import { TaskEditorModal } from "./TaskEditorModal.jsx";
import { TaskCardList } from "./TaskMobileList.jsx";

const { Text, Title } = Typography;

export function ProjectTasksSection() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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

  const taskCardProps = {
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
    isMobile,
  };

  const emptyDescription = canManageTasks
    ? "Chưa có task trong dự án"
    : "Bạn chưa được giao task nào trong dự án này";

  const existingTaskFiles =
    taskEditor.taskId && taskEditor.open ? getTaskFiles(taskEditor.taskId) : [];

  return (
    <>
      <Card
        title={
          <div>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              Công việc dự án
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {sortedTasks.length} task
            </Text>
          </div>
        }
        extra={
          !isMobile && canManageTasks ? (
            <Button type="primary" onClick={() => openTaskEditor()}>
              Thêm task
            </Button>
          ) : null
        }
        style={sectionCardStyle}
        styles={sectionCardStyles}
      >
        {isMobile && canManageTasks && (
          <Button
            type="primary"
            block
            onClick={() => openTaskEditor()}
            style={{ marginBottom: 14 }}
          >
            Thêm task
          </Button>
        )}

        {sortedTasks.length ? (
          <div style={createScrollBoxStyle(SECTION_SCROLL.tasks)}>
            <TaskCardList tasks={sortedTasks} {...taskCardProps} />
          </div>
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
