import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Radio,
  Row,
  Typography,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getEmployee, getProjects, updateEmployee } from "@/utils/api";
import { AccountRoleTag } from "@/features/employee";

const { Title, Text } = Typography;

const EMAIL_RULES = [{ type: "email", message: "Email không hợp lệ" }];

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
    <Row gutter={20}>
      <Col span={16}>
        <Card>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Avatar src={displayAvatar} size={120}>
              {(employee.name || "N").trim().charAt(0).toUpperCase()}
            </Avatar>

            <div style={{ marginTop: 12 }}>
              <Upload beforeUpload={handleAvatarSelect} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
              </Upload>
            </div>

            <Title level={3} style={{ marginTop: 16 }}>
              {employee.name}
            </Title>
            {employee.username ? (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Đăng nhập: {employee.username}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">ID nhân viên: {employee.employeeCode || "----"}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    Tạo tài khoản: {formatAccountCreatedAt(employee.accountCreatedAt)}
                  </Text>
                </div>
                {employee.accountRole ? (
                  <div style={{ marginTop: 6 }}>
                    <AccountRoleTag role={employee.accountRole} />
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Chưa có tài khoản đăng nhập</Text>
              </div>
            )}
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
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
                <Radio.Group>
                  <Radio.Button value="employee">Nhân viên</Radio.Button>
                  <Radio.Button value="PM">Quản lý dự án</Radio.Button>
                </Radio.Group>
              </Form.Item>
            ) : null}

            <Button type="primary" htmlType="submit" loading={saving}>
              Cập nhật
            </Button>
          </Form>
        </Card>
      </Col>

      <Col span={8}>
        <Card title="Dự án tham gia">
          <List
            dataSource={projects}
            locale={{ emptyText: "Chưa tham gia dự án nào" }}
            renderItem={(item) => (
              <List.Item>
                <Text>{item.name}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
}
