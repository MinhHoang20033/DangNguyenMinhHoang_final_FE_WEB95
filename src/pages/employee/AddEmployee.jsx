import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Form,
  Grid,
  Input,
  Radio,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { addEmployee } from "@/utils/api";

const { Title, Text } = Typography;
const EMAIL_RULES = [{ type: "email", message: "Email không hợp lệ" }];

export default function AddEmployee() {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/employees")}
        style={{ paddingInline: 0, width: "fit-content" }}
      >
        Quay lại danh sách
      </Button>

      <Card
        style={{
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            Thêm nhân viên
          </Title>
          <Text type="secondary">Nhập thông tin và tạo tài khoản đăng nhập</Text>
        </div>

        <Form
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ userRole: "employee" }}
          size={isMobile ? "large" : "middle"}
        >
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
              <Button icon={<UploadOutlined />} block={isMobile}>
                Tải ảnh đại diện
              </Button>
            </Upload>

            {preview ? (
              <div style={{ marginTop: 12 }}>
                <Avatar src={preview} size={80} />
              </div>
            ) : null}
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
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
            >
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

          <Button type="primary" htmlType="submit" loading={submitting} block={isMobile}>
            Thêm nhân viên
          </Button>
        </Form>
      </Card>
    </Space>
  );
}
