import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { AuthContext } from "@/context/AuthContextValue";
import { login as apiLogin } from "@/utils/api";

const { Link } = Typography;

const getHomePath = (user) => {
  if (user?.role === "admin") {
    return "/dashboard";
  }

  return "/projects";
};

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const data = await apiLogin(values.username, values.password);
      login(data.token, data.user);
      navigate(getHomePath(data.user));
    } catch (err) {
      message.error(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="auth-page">
      <Card title="Đăng nhập quản lý dự án" className="auth-card">
        <Form onFinish={onFinish} layout="vertical" requiredMark={false} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input placeholder="Tên đăng nhập" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Mật khẩu" autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Link onClick={() => navigate("/forgot-password")}>Quên mật khẩu?</Link>
        </div>
      </Card>
    </div>
  );
}
