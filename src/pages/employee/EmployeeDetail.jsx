import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  List,
  Radio,
  Row,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { getEmployee, getProjects, updateEmployee } from "@/utils/api";
import { AccountRoleTag } from "@/features/employee";

const { Title, Text } = Typography;

const EMAIL_RULES = [{ type: "email", message: "Email không hợp lệ" }];

const softCardStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
};

const formatAccountCreatedAt = (value) => {
  if (!value) return "Chưa có dữ liệu";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có dữ liệu";
  }
  return parsed.toLocaleString("vi-VN");
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const [found, allProjects] = await Promise.all([getEmployee(id), getProjects()]);
        if (cancelled) return;

        setEmployee(found);
        form.setFieldsValue({
          ...found,
          userRole: found.accountRole || "employee",
        });
        setAvatarPreview("");
        setAvatarFile(null);

        const joined = allProjects.filter((project) =>
          project.members?.some((member) => member.employeeId === id),
        );
        setProjects(joined);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Không tải được thông tin nhân viên");
          setEmployee(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [form, id]);

  const handleAvatarSelect = (selectedFile) => {
    setAvatarFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
    return false;
  };

  const onFinish = async (values) => {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("email", values.email?.trim() || "");
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");
      formData.append("role", values.role || "");
      formData.append("bankAccount", values.bankAccount || "");
      formData.append("salary", values.salary || 0);

      if (employee?.username) {
        formData.append("userRole", values.userRole || "employee");
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updated = await updateEmployee(id, formData);
      setEmployee(updated);
      form.setFieldsValue({
        ...updated,
        userRole: updated.accountRole || values.userRole || "employee",
      });
      setAvatarFile(null);
      setAvatarPreview("");
      message.success("Cập nhật nhân viên thành công");
    } catch (err) {
      message.error(err.message || "Không thể cập nhật nhân viên");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (loadError || !employee) {
    return <Empty description={loadError || "Không tìm thấy nhân viên"} style={{ marginTop: 40 }} />;
  }

  const displayAvatar = avatarPreview || employee.avatar || undefined;

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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={softCardStyle}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar src={displayAvatar} size={isMobile ? 96 : 120}>
                {(employee.name || "N").trim().charAt(0).toUpperCase()}
              </Avatar>

              <div style={{ marginTop: 12 }}>
                <Upload beforeUpload={handleAvatarSelect} showUploadList={false} accept="image/*">
                  <Button icon={<UploadOutlined />} block={isMobile}>
                    Đổi ảnh đại diện
                  </Button>
                </Upload>
              </div>

              <Title level={isMobile ? 4 : 3} style={{ marginTop: 16, marginBottom: 4 }}>
                {employee.name}
              </Title>
              {employee.username ? (
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Text type="secondary">Đăng nhập: {employee.username}</Text>
                  <Text type="secondary">ID nhân viên: {employee.employeeCode || "----"}</Text>
                  <Text type="secondary">
                    Tạo tài khoản: {formatAccountCreatedAt(employee.accountCreatedAt)}
                  </Text>
                  {employee.accountRole ? <AccountRoleTag role={employee.accountRole} /> : null}
                </Space>
              ) : (
                <Text type="secondary">Chưa có tài khoản đăng nhập</Text>
              )}
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} size={isMobile ? "large" : "middle"}>
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
                <Input />
              </Form.Item>

              <Form.Item name="bankAccount" label="Số tài khoản">
                <Input />
              </Form.Item>

              <Form.Item name="salary" label="Lương">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    value === null || value === undefined || value === ""
                      ? ""
                      : String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => (value ? Number(String(value).replace(/\./g, "")) : 0)}
                />
              </Form.Item>

              {employee.username ? (
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
              ) : null}

              <Button type="primary" htmlType="submit" loading={saving} block={isMobile}>
                Cập nhật
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Dự án tham gia" style={softCardStyle}>
            <List
              dataSource={projects}
              locale={{ emptyText: "Chưa tham gia dự án nào" }}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/projects/${item._id}`)}
                >
                  <Text strong style={{ wordBreak: "break-word" }}>
                    {item.name}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
