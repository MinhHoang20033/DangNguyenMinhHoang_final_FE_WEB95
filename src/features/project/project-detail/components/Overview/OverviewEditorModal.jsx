import { DatePicker, Input, Modal, Select, Space, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export function OverviewEditorModal({
  open,
  saving,
  overviewDraft,
  onDraftChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      title="Cập nhật thông tin dự án"
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Cập nhật thông tin"
      confirmLoading={saving}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <Text>Tên dự án</Text>
          <Input
            value={overviewDraft.name}
            onChange={(event) => onDraftChange({ name: event.target.value })}
          />
        </div>

        <div>
          <Text>Trạng thái</Text>
          <Select
            style={{ width: "100%" }}
            value={overviewDraft.status}
            onChange={(value) => onDraftChange({ status: value })}
            options={[
              { value: "active", label: "Đang triển khai" },
              { value: "inactive", label: "Đã hoàn thành" },
            ]}
          />
        </div>

        <div>
          <Text>Hạn dự án</Text>
          <DatePicker
            style={{ width: "100%" }}
            value={overviewDraft.deadline ? dayjs(overviewDraft.deadline) : null}
            onChange={(value) =>
              onDraftChange({
                deadline: value ? value.format("YYYY-MM-DD") : "",
              })
            }
            format="DD/MM/YYYY"
            placeholder="Chọn ngày (tuỳ chọn)"
            allowClear
          />
        </div>

        <div>
          <Text>Quản lý dự án</Text>
          <Input
            value={overviewDraft.managerName}
            placeholder="Nhập tên quản lý dự án"
            onChange={(event) => onDraftChange({ managerName: event.target.value })}
          />
        </div>

        <div>
          <Text>Công trình</Text>
          <Input
            value={overviewDraft.siteName}
            onChange={(event) => onDraftChange({ siteName: event.target.value })}
          />
        </div>

        <div>
          <Text>Mã số</Text>
          <Input
            value={overviewDraft.code}
            onChange={(event) => onDraftChange({ code: event.target.value })}
          />
        </div>

        <div>
          <Text>Biểu mẫu</Text>
          <Input
            value={overviewDraft.formNo}
            onChange={(event) => onDraftChange({ formNo: event.target.value })}
          />
        </div>

        <div>
          <Text>Mô tả</Text>
          <Input.TextArea
            rows={4}
            value={overviewDraft.desc}
            onChange={(event) => onDraftChange({ desc: event.target.value })}
          />
        </div>
      </Space>
    </Modal>
  );
}
