import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { verifyPasswordOtp } from "@/utils/api";

const { Text, Link } = Typography;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || sessionStorage.getItem("reset_email") || "";

  useEffect(() => {
    if (location.state?.email) {
      sessionStorage.setItem("reset_email", location.state.email);
    }
  }, [location.state?.email]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (values) => {
    try {
      const otp = String(values.otp || "").trim();
      const result = await verifyPasswordOtp(email, otp);
      sessionStorage.setItem("reset_token", result.resetToken);
      navigate("/reset-password");
      message.success("Xác thực OTP thành công");
    } catch (err) {
      message.error(err.message || "Mã OTP không hợp lệ");
    }
  };

  return (
    <div className="auth-page">
      <Card title="Xác Thực OTP" className="auth-card">
        <div style={{ marginBottom: 16 }}>
          <Text>
            Mã OTP đã được gửi đến: <strong>{email}</strong>
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleVerifyOtp} size="large">
          <Form.Item
            name="otp"
            label="Mã OTP"
            rules={[
              { required: true, message: "Vui lòng nhập mã OTP" },
              { pattern: /^\d{6}$/, message: "Mã OTP phải gồm đúng 6 chữ số" },
            ]}
          >
            <Input placeholder="Nhập mã OTP gồm 6 số" maxLength={6} inputMode="numeric" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Xác thực OTP
          </Button>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Link onClick={() => navigate("/forgot-password")}>Gửi lại OTP</Link>
        </div>
      </Card>
    </div>
  );
}
