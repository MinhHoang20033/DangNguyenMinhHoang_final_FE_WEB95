import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Checkbox, Space, Tag, Typography } from "antd";

import {
  EMPTY_VALUE,
  TASK_EXCEL_ACCEPT,
} from "@/features/project";
import {
  canDeleteTaskSubmissionFile,
  getTaskStatus,
} from "../../helpers/taskHelpers.js";

const { Text } = Typography;

export function buildTaskTableColumns({
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
}) {
  return [
    {
      title: "Tên task",
      dataIndex: "title",
      width: 190,
      render: (value, task) => (
        <Text
          strong
          style={{
            textDecoration: task.completed ? "line-through" : "none",
            color: task.completed ? "#6b7280" : "inherit",
          }}
        >
          {value || EMPTY_VALUE}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      width: 150,
      render: (_, task) => {
        const status = getTaskStatus(task);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      width: 140,
      render: (value) => value || "Chưa đặt",
    },
    {
      title: "Mô tả task",
      dataIndex: "description",
      width: 260,
      render: (value, task) => (
        <Text
          type="secondary"
          style={{
            whiteSpace: "pre-wrap",
            textDecoration: task.completed ? "line-through" : "none",
          }}
        >
          {value || "Chưa có mô tả"}
        </Text>
      ),
    },
    {
      title: "Thành viên làm task",
      width: 260,
      render: (_, task) => {
        const assignees = getTaskAssignees(task);
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {assignees.length ? (
              assignees.map((member) => (
                <span
                  key={`${task.id}-${member._id}-assignee`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    width: "fit-content",
                  }}
                >
                  <Avatar
                    size="small"
                    src={member.avatar || undefined}
                    style={{ backgroundColor: member.avatar ? "transparent" : "#1677ff" }}
                  >
                    {(member.name || "N").trim().charAt(0).toUpperCase()}
                  </Avatar>
                  <Text style={{ fontSize: 13 }}>{member.name}</Text>
                </span>
              ))
            ) : (
              <Text type="secondary">Chưa giao thành viên</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "File đã upload",
      width: 240,
      render: (_, task) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {(task.files ?? []).length ? (
            (task.files ?? []).map((file) => (
              <Space key={`${task.id}-${file.id}`} wrap size="small">
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openFilePreview(file)}>
                  Xem trước
                </Button>
                <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadFile(file)}>
                  {file.name || file.originalName || "Excel"}
                </Button>
                {canManageTasks ? (
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDeleteTaskFile(task.id, file.id, "files")}
                  >
                    Xóa
                  </Button>
                ) : null}
              </Space>
            ))
          ) : (
            <Text type="secondary">Chưa có file</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Nơi gửi lại file",
      width: 260,
      render: (_, task) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {(task.submissionFiles ?? []).length ? (
            (task.submissionFiles ?? []).map((file) => (
              <Space key={`${task.id}-submission-${file.id}`} wrap size="small">
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openFilePreview(file)}>
                  Xem trước
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadFile(file)}
                >
                  {file.name || file.originalName || "Excel hoàn thành"}
                </Button>
                {canDeleteTaskSubmissionFile(task, file, userEmployeeId, canManageTasks) ? (
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDeleteTaskFile(task.id, file.id, "submissionFiles")}
                  >
                    Xóa
                  </Button>
                ) : null}
              </Space>
            ))
          ) : (
            <Text type="secondary">Chưa có file hoàn thành</Text>
          )}
          <input
            ref={(node) => {
              taskUploadInputRefs.current[task.id] = node;
            }}
            type="file"
            multiple
            accept={TASK_EXCEL_ACCEPT}
            style={{ display: "none" }}
            onChange={(event) => handleTaskRowFileUpload(task.id, event)}
          />
          <Button
            onClick={() => triggerTaskFilePicker(task.id)}
            loading={uploadingTaskId === task.id}
          >
            Gửi lại file
          </Button>
        </Space>
      ),
    },
    {
      title: "Task con",
      width: 320,
      render: (_, task) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {(task.subtasks ?? []).length ? (
            (task.subtasks ?? []).map((subtask) => (
              <div
                key={`${task.id}-${subtask.id}`}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "8px 10px",
                  background: "#fafafa",
                }}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                  >
                    <Text
                      style={{
                        textDecoration: subtask.completed ? "line-through" : "none",
                      }}
                    >
                      {subtask.title || "Task con"}
                    </Text>
                  </Checkbox>
                  <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
                    {subtask.description || "Chưa có mô tả"}
                  </Text>
                  {canManageTasks ? (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        onClick={() => openSubtaskEditor(task.id, subtask)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => confirmRemoveSubtask(task.id, subtask.id, subtask.title)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  ) : null}
                </Space>
              </div>
            ))
          ) : (
            <Text type="secondary">Chưa có task con</Text>
          )}
          {canManageTasks ? (
            <Button size="small" onClick={() => openSubtaskEditor(task.id)}>
              Thêm task con
            </Button>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      width: 180,
      fixed: "right",
      render: (_, task) => (
        <Space direction="vertical" size="small">
          <Checkbox checked={task.completed} onChange={() => toggleTaskCompletion(task.id)}>
            Hoàn thành
          </Checkbox>
          {canManageTasks ? (
            <>
              <Button type="text" onClick={() => openTaskEditor(task)}>
                Chỉnh sửa
              </Button>
              <Button
                type="text"
                danger
                onClick={() => confirmRemoveTask(task.id, task.title)}
                loading={saving}
              >
                Xóa
              </Button>
            </>
          ) : null}
        </Space>
      ),
    },
  ];
}
