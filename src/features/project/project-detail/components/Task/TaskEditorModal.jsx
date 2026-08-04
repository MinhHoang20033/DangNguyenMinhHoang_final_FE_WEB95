import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Modal, Select, Space, Typography } from "antd";
import dayjs from "dayjs";

import { TASK_EXCEL_ACCEPT } from "@/features/project";

const { Text } = Typography;

export function TaskEditorModal({
  taskEditor,
  saving,
  projectMemberOptions,
  onCancel,
  onSubmit,
  onChange,
  onFileSelection,
  existingFiles,
  onPreviewFile,
  onDownloadFile,
}) {
  return (
    <Modal
      open={taskEditor.open}
      title={taskEditor.taskId ? "Cập nhật task" : "Thêm task mới"}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={taskEditor.taskId ? "Lưu thay đổi" : "Tạo task"}
      confirmLoading={saving}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text>Tên task</Text>
          <Input
            value={taskEditor.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </div>

        <div>
          <Text>Deadline</Text>
          <DatePicker
            style={{ width: "100%" }}
            value={taskEditor.deadline ? dayjs(taskEditor.deadline) : null}
            onChange={(value) =>
              onChange({
                deadline: value ? value.format("YYYY-MM-DD") : "",
              })
            }
            format="DD/MM/YYYY"
            placeholder="Chọn ngày (tuỳ chọn)"
            allowClear
            placement="bottomLeft"
            builtinPlacements={{
              bottomLeft: {
                points: ["tl", "bl"],
                offset: [0, 4],
                overflow: { adjustX: true, adjustY: false },
              },
            }}
          />
        </div>

        <div>
          <Text>Mô tả task</Text>
          <Input.TextArea
            rows={4}
            value={taskEditor.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>

        <div>
          <Text>Thành viên phụ trách</Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Chọn thành viên của dự án"
            value={taskEditor.assigneeIds}
            options={projectMemberOptions}
            onChange={(value) => onChange({ assigneeIds: value })}
          />
        </div>

        <div>
          <Text>Tệp Excel của task</Text>
          <input
            type="file"
            multiple
            accept={TASK_EXCEL_ACCEPT}
            onChange={onFileSelection}
            style={{ display: "block", marginTop: 8 }}
          />
          {!!taskEditor.pendingFiles.length && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Sẽ tải lên: {taskEditor.pendingFiles.map((file) => file.name).join(", ")}
              </Text>
            </div>
          )}
          {!!existingFiles.length && (
            <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12 }}>
              {existingFiles.map((file) => (
                <Space key={file.id} wrap>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => onPreviewFile(file)}>
                    Xem trước {file.name || file.originalName}
                  </Button>
                  <Button type="link" icon={<DownloadOutlined />} onClick={() => onDownloadFile(file)}>
                    Tải tệp
                  </Button>
                </Space>
              ))}
            </Space>
          )}
        </div>
      </Space>
    </Modal>
  );
}
