import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { requestPasswordOtp } from "@/utils/api";

const { Link } = Typography;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleRequestOtp = async (values) => {
    try {
      const result = await requestPasswordOtp(values.email);

      sessionStorage.setItem("reset_email", values.email);

      navigate("/verify-otp", {
        state: { email: values.email },
      });

      const sentTo = result.email;
      message.success(`Đã gửi mã OTP đến ${sentTo}. Vui lòng kiểm tra hộp thư (cả thư rác).`);
    } catch (err) {
      message.error(err.message || "Không thể gửi OTP");
    }
  };

  return (
    <Card
      title="Khôi Phục Mật Khẩu"
      style={{
        width: 420,
        margin: "80px auto",
      }}
    >
      <Form layout="vertical" onFinish={handleRequestOtp}>
        <Form.Item
          name="email"
          label="Email nhân viên"
          rules={[
            { required: true, message: "Vui lòng nhập email nhân viên" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email nhân viên" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Gửi OTP
        </Button>
      </Form>

      <div style={{ marginTop: 16 }}>
        <Link onClick={() => navigate("/login")}>Quay lại đăng nhập</Link>
      </div>
    </Card>
  );
}
