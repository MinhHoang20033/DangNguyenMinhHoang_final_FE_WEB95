import { Input, Modal, Space, Typography } from "antd";

const { Text } = Typography;

export function SubtaskEditorModal({ subtaskEditor, saving, onCancel, onSubmit, onChange }) {
  return (
    <Modal
      open={subtaskEditor.open}
      title={subtaskEditor.subtaskId ? "Cập nhật task con" : "Thêm task con"}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={subtaskEditor.subtaskId ? "Lưu thay đổi" : "Tạo task con"}
      confirmLoading={saving}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text>Tên task con</Text>
          <Input
            value={subtaskEditor.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </div>

        <div>
          <Text>Mô tả task con</Text>
          <Input.TextArea
            rows={4}
            value={subtaskEditor.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>
      </Space>
    </Modal>
  );
}
