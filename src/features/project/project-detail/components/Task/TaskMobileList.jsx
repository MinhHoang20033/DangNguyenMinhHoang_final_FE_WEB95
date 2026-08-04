import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Checkbox, Collapse, Space, Tag, Typography } from "antd";

import { EMPTY_VALUE, TASK_EXCEL_ACCEPT } from "@/features/project";
import {
  canDeleteTaskSubmissionFile,
  getTaskStatus,
} from "../../helpers/taskHelpers.js";
import { softItemCardStyle } from "../../helpers/sectionStyles.js";

const { Text } = Typography;

export function TaskCardList({
  tasks,
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
  isMobile = false,
}) {
  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        const assignees = getTaskAssignees(task);
        const fileCount = (task.files ?? []).length;
        const submissionCount = (task.submissionFiles ?? []).length;
        const subtaskCount = (task.subtasks ?? []).length;

        return (
          <div
            key={task.id}
            style={{
              ...softItemCardStyle,
              padding: isMobile ? 12 : 14,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? 10 : 14,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 15,
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#6b7280" : "inherit",
                    }}
                  >
                    {task.title || EMPTY_VALUE}
                  </Text>
                  <Tag color={status.color} style={{ marginInlineEnd: 0 }}>
                    {status.label}
                  </Tag>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 14px",
                    alignItems: "center",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Deadline: {task.deadline || "Chưa đặt"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    File: {fileCount} · Gửi lại: {submissionCount} · Task con: {subtaskCount}
                  </Text>
                  <Space size={[6, 6]} wrap>
                    {assignees.length ? (
                      assignees.slice(0, 4).map((member) => (
                        <span
                          key={`${task.id}-${member._id}-assignee`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <Avatar
                            size={18}
                            src={member.avatar || undefined}
                            style={{ backgroundColor: member.avatar ? "transparent" : "#1677ff" }}
                          >
                            {(member.name || "N").trim().charAt(0).toUpperCase()}
                          </Avatar>
                          <Text style={{ fontSize: 12 }}>{member.name}</Text>
                        </span>
                      ))
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Chưa giao thành viên
                      </Text>
                    )}
                    {assignees.length > 4 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        +{assignees.length - 4}
                      </Text>
                    )}
                  </Space>
                </div>
              </div>

              <Space wrap size="small" style={{ flexShrink: 0 }}>
                <Checkbox checked={task.completed} onChange={() => toggleTaskCompletion(task.id)}>
                  Xong
                </Checkbox>
                {canManageTasks ? (
                  <>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openTaskEditor(task)}>
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => confirmRemoveTask(task.id, task.title)}
                      loading={saving}
                    >
                      Xóa
                    </Button>
                  </>
                ) : null}
              </Space>
            </div>

            <Collapse
              ghost
              size="small"
              style={{ marginTop: 4 }}
              items={[
                {
                  key: "details",
                  label: (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Chi tiết · mô tả · file · task con
                    </Text>
                  ),
                  children: (
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Mô tả
                        </Text>
                        <div>
                          <Text style={{ whiteSpace: "pre-wrap" }}>
                            {task.description || "Chưa có mô tả"}
                          </Text>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            File đính kèm
                          </Text>
                          <Space direction="vertical" size={4} style={{ width: "100%", marginTop: 4 }}>
                            {(task.files ?? []).length ? (
                              (task.files ?? []).map((file) => (
                                <Space key={`${task.id}-${file.id}`} wrap size="small">
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => openFilePreview(file)}
                                  >
                                    Xem
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadFile(file)}
                                  >
                                    {file.name || file.originalName || "Excel"}
                                  </Button>
                                  {canManageTasks ? (
                                    <Button
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() =>
                                        handleDeleteTaskFile(
                                          task.id,
                                          file.id,
                                          "files",
                                          file.name || file.originalName || "tệp này",
                                        )
                                      }
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
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            File hoàn thành
                          </Text>
                          <Space direction="vertical" size={6} style={{ width: "100%", marginTop: 4 }}>
                            {(task.submissionFiles ?? []).length ? (
                              (task.submissionFiles ?? []).map((file) => (
                                <Space key={`${task.id}-submission-${file.id}`} wrap size="small">
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => openFilePreview(file)}
                                  >
                                    Xem
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadFile(file)}
                                  >
                                    {file.name || file.originalName || "Excel"}
                                  </Button>
                                  {canDeleteTaskSubmissionFile(
                                    task,
                                    file,
                                    userEmployeeId,
                                    canManageTasks,
                                  ) ? (
                                    <Button
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() =>
                                        handleDeleteTaskFile(
                                          task.id,
                                          file.id,
                                          "submissionFiles",
                                          file.name || file.originalName || "tệp này",
                                        )
                                      }
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
                              size="small"
                              onClick={() => triggerTaskFilePicker(task.id)}
                              loading={uploadingTaskId === task.id}
                            >
                              Gửi lại file
                            </Button>
                          </Space>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Task con
                          </Text>
                          <Space direction="vertical" size={6} style={{ width: "100%", marginTop: 4 }}>
                            {(task.subtasks ?? []).length ? (
                              (task.subtasks ?? []).map((subtask) => (
                                <div
                                  key={`${task.id}-${subtask.id}`}
                                  style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 10,
                                    padding: "6px 8px",
                                    background: "#fafafa",
                                  }}
                                >
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
                                  {canManageTasks ? (
                                    <Space size="small">
                                      <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => openSubtaskEditor(task.id, subtask)}
                                      >
                                        Sửa
                                      </Button>
                                      <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          confirmRemoveSubtask(task.id, subtask.id, subtask.title)
                                        }
                                      >
                                        Xóa
                                      </Button>
                                    </Space>
                                  ) : null}
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
                        </div>
                      </div>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        );
      })}
    </Space>
  );
}

export const TaskMobileList = TaskCardList;
