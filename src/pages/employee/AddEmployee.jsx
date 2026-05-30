import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Form, Input, Radio, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { addEmployee } from "@/utils/api";

const EMAIL_RULES = [{ type: "email", message: "Email không hợp lệ" }];

export default function AddEmployee() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePreview = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", values.name || "");
      formData.append("email", values.email?.trim() || "");
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");
      formData.append("role", values.role || "");
      formData.append("bankAccount", values.bankAccount || "");
      formData.append("salary", values.salary || 0);
      formData.append("userRole", values.userRole || "employee");
      formData.append("username", values.username || "");
      formData.append("password", values.password || "");

      if (file) {
        formData.append("avatar", file);
      }

      await addEmployee(formData);
      message.success("Đã thêm nhân viên");
      navigate("/employees");
    } catch (error) {
      message.error(error.message || "Không thể thêm nhân viên");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onFinish={onFinish} layout="vertical" initialValues={{ userRole: "employee" }}>
      <Form.Item label="Ảnh đại diện">
        <Upload
          beforeUpload={(selectedFile) => {
            setFile(selectedFile);
            handlePreview(selectedFile);
            return false;
          }}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Tải ảnh đại diện</Button>
        </Upload>

        {preview && (
          <div style={{ marginTop: 10 }}>
            <Avatar src={preview} size={80} />
          </div>
        )}
      </Form.Item>

      <Form.Item name="name" label="Tên">
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={EMAIL_RULES}>
        <Input type="email" placeholder="name@company.com" />
      </Form.Item>

      <Form.Item name="phone" label="Số điện thoại">
        <Input />
      </Form.Item>

      <Form.Item name="address" label="Địa chỉ">
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Chức danh / vai trò công việc">
        <Input placeholder="VD: Kỹ sư, Quản lý dự án..." />
      </Form.Item>

      <Form.Item name="bankAccount" label="Số tài khoản">
        <Input />
      </Form.Item>

      <Form.Item name="salary" label="Lương">
        <Input />
      </Form.Item>

      <Form.Item
        name="userRole"
        label="Loại tài khoản đăng nhập"
        rules={[{ required: true, message: "Vui lòng chọn loại tài khoản" }]}
      >
        <Radio.Group>
          <Radio.Button value="employee">Nhân viên</Radio.Button>
          <Radio.Button value="PM">Quản lý dự án</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="username"
        label="Tên đăng nhập"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <Input.Password />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={submitting}>
        Thêm nhân viên
      </Button>
    </Form>
  );
}
