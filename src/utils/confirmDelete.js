import { Modal } from "antd";

export function confirmDeleteAction({
  title = "Xác nhận xóa",
  content = "Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.",
  okText = "Xóa",
  onOk,
}) {
  Modal.confirm({
    title,
    content,
    okText,
    okType: "danger",
    cancelText: "Hủy",
    onOk,
  });
}
