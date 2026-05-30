import { CloseOutlined, CommentOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Typography } from "antd";

import { formatDateTime } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

export function ProjectChatWidget() {
  const {
    chatOpen,
    setChatOpen,
    chatMessages,
    currentChatAuthor,
    chatInput,
    setChatInput,
    submitChatMessage,
  } = useProjectDetailModel();

  return (
    <>
      {chatOpen && (
        <Card
          title="Hộp chat"
          extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setChatOpen(false)} />}
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            width: 360,
            zIndex: 1000,
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            height: 420,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {chatMessages.map((chat) => (
                <div
                  key={chat.id}
                  style={{
                    alignSelf: chat.author === currentChatAuthor ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {chat.author}
                  </Text>
                  <div
                    style={{
                      marginTop: 4,
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: chat.author === currentChatAuthor ? "#dcfce7" : "#f3f4f6",
                    }}
                  >
                    <Text>{chat.text}</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDateTime(chat.createdAt)}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </div>

          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onPressEnter={submitChatMessage}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={submitChatMessage} />
          </Space.Compact>
        </Card>
      )}

      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<CommentOutlined />}
        onClick={() => setChatOpen((current) => !current)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          zIndex: 1001,
          boxShadow: "0 16px 30px rgba(37, 99, 235, 0.35)",
        }}
      />
    </>
  );
}
