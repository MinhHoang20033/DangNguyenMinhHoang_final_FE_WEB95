import { useMemo, useState } from "react";
import { Button, Card, Empty, Grid, Input, Select, Space, Typography } from "antd";

import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";
import {
  EMPTY_TASK_FILTERS,
  TASK_DEADLINE_FILTER_OPTIONS,
  TASK_STATUS_FILTER_OPTIONS,
  filterTasks,
  hasActiveTaskFilters,
} from "../../helpers/taskFilterHelpers.js";
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
  const [taskFilters, setTaskFilters] = useState(EMPTY_TASK_FILTERS);

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
    confirmDeleteTaskFile,
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

  const filteredTasks = useMemo(
    () => filterTasks(sortedTasks, taskFilters),
    [sortedTasks, taskFilters],
  );

  const assigneeOptions = useMemo(
    () => [{ value: "all", label: "Tất cả người phụ trách" }, ...projectMemberOptions],
    [projectMemberOptions],
  );

  const taskCardProps = {
    getTaskAssignees,
    openFilePreview,
    handleDownloadFile,
    handleDeleteTaskFile: confirmDeleteTaskFile,
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

  const emptyDescription = (() => {
    if (!sortedTasks.length) {
      return canManageTasks
        ? "Chưa có task trong dự án"
        : "Bạn chưa được giao task nào trong dự án này";
    }

    if (hasActiveTaskFilters(taskFilters)) {
      return "Không có task phù hợp với bộ lọc";
    }

    return "Chưa có task trong dự án";
  })();

  const existingTaskFiles =
    taskEditor.taskId && taskEditor.open ? getTaskFiles(taskEditor.taskId) : [];

  const resetTaskFilters = () => setTaskFilters(EMPTY_TASK_FILTERS);

  return (
    <>
      <Card
        title={
          <div>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              Công việc dự án
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {filteredTasks.length}/{sortedTasks.length} task
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
          <>
            <Space
              direction="vertical"
              size={12}
              style={{ width: "100%", marginBottom: 16 }}
            >
              <Input.Search
                placeholder="Tìm theo tên hoặc mô tả task..."
                value={taskFilters.keyword}
                onChange={(event) =>
                  setTaskFilters((current) => ({ ...current, keyword: event.target.value }))
                }
                allowClear
              />

              <Space wrap size={12} style={{ width: "100%" }}>
                <Select
                  value={taskFilters.status}
                  options={TASK_STATUS_FILTER_OPTIONS}
                  onChange={(status) => setTaskFilters((current) => ({ ...current, status }))}
                  style={{ minWidth: isMobile ? "100%" : 180 }}
                />
                <Select
                  value={taskFilters.assigneeId}
                  options={assigneeOptions}
                  onChange={(assigneeId) =>
                    setTaskFilters((current) => ({ ...current, assigneeId }))
                  }
                  style={{ minWidth: isMobile ? "100%" : 220 }}
                  showSearch
                  optionFilterProp="label"
                />
                <Select
                  value={taskFilters.deadline}
                  options={TASK_DEADLINE_FILTER_OPTIONS}
                  onChange={(deadline) => setTaskFilters((current) => ({ ...current, deadline }))}
                  style={{ minWidth: isMobile ? "100%" : 180 }}
                />
                {hasActiveTaskFilters(taskFilters) ? (
                  <Button onClick={resetTaskFilters}>Xóa bộ lọc</Button>
                ) : null}
              </Space>
            </Space>

            {filteredTasks.length ? (
              <div style={createScrollBoxStyle(SECTION_SCROLL.tasks)}>
                <TaskCardList tasks={filteredTasks} {...taskCardProps} />
              </div>
            ) : (
              <Empty description={emptyDescription} />
            )}
          </>
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
