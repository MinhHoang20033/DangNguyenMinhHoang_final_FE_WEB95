import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Checkbox, Space, Tag, Typography } from "antd";

import { EMPTY_VALUE, TASK_EXCEL_ACCEPT } from "@/features/project";
import {
  canDeleteTaskSubmissionFile,
  getTaskStatus,
} from "../../helpers/taskHelpers.js";
import { softItemCardStyle } from "../../helpers/sectionStyles.js";

const { Text, Paragraph } = Typography;

function MetaBox({ label, children, minWidth = 160 }) {
  return (
    <div
      style={{
        flex: `1 1 ${minWidth}px`,
        minWidth,
        borderRadius: 14,
        background: "#fff",
        border: "1px solid #eef2f7",
        padding: "10px 12px",
      }}
    >
      <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
        {label}
      </Text>
      {children}
    </div>
  );
}

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
    <Space direction="vertical" size={14} style={{ width: "100%" }}>
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        const assignees = getTaskAssignees(task);

        return (
          <Card
            key={task.id}
            size="small"
            styles={{ body: { padding: isMobile ? 14 : 18 } }}
            style={softItemCardStyle}
          >
            <Space direction="vertical" size={isMobile ? 12 : 14} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <Text
                  strong
                  style={{
                    flex: 1,
                    fontSize: isMobile ? 15 : 16,
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
                  flexDirection: "row",
                  gap: 10,
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <MetaBox label="Deadline" minWidth={isMobile ? 150 : 180}>
                  <Text>{task.deadline || "Chưa đặt"}</Text>
                </MetaBox>
                <MetaBox label="Mô tả" minWidth={isMobile ? 220 : 260}>
                  <Paragraph type="secondary" style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                    {task.description || "Chưa có mô tả"}
                  </Paragraph>
                </MetaBox>
                <MetaBox label="Thành viên" minWidth={isMobile ? 200 : 240}>
                  <Space wrap size={[8, 8]}>
                    {assignees.length ? (
                      assignees.map((member) => (
                        <span
                          key={`${task.id}-${member._id}-assignee`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
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
                </MetaBox>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 10,
                }}
              >
                <MetaBox label="File đính kèm" minWidth={220}>
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
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
                </MetaBox>

                <MetaBox label="File hoàn thành" minWidth={240}>
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
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
                              type="link"
                              size="small"
                              danger
                              onClick={() =>
                                handleDeleteTaskFile(task.id, file.id, "submissionFiles")
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
                      block
                      onClick={() => triggerTaskFilePicker(task.id)}
                      loading={uploadingTaskId === task.id}
                    >
                      Gửi lại file
                    </Button>
                  </Space>
                </MetaBox>

                <MetaBox label="Task con" minWidth={220}>
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
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
                            <Space size="small" style={{ marginTop: 4 }}>
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
                      <Button size="small" block onClick={() => openSubtaskEditor(task.id)}>
                        Thêm task con
                      </Button>
                    ) : null}
                  </Space>
                </MetaBox>
              </div>

              <Space wrap style={{ width: "100%" }}>
                <Checkbox checked={task.completed} onChange={() => toggleTaskCompletion(task.id)}>
                  Hoàn thành
                </Checkbox>
                {canManageTasks ? (
                  <>
                    <Button type="link" onClick={() => openTaskEditor(task)}>
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="link"
                      danger
                      onClick={() => confirmRemoveTask(task.id, task.title)}
                      loading={saving}
                    >
                      Xóa
                    </Button>
                  </>
                ) : null}
              </Space>
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}

/** @deprecated Use TaskCardList */
export const TaskMobileList = TaskCardList;
