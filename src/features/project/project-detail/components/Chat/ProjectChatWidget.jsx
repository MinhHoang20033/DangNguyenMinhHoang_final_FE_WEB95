import { useEffect, useRef } from "react";
import { CloseOutlined, CommentOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Input, Space, Spin, Typography } from "antd";

import { formatDateTime } from "@/features/project";
import { useProjectDetailModel } from "../../ProjectDetailContext.jsx";

const { Text } = Typography;

const isOwnMessage = (message, currentChatAuthorId, currentChatAuthor) => {
  if (currentChatAuthorId && message.authorId) {
    return message.authorId === currentChatAuthorId;
  }

  if (message.authorId || currentChatAuthorId) {
    return false;
  }

  return message.author === currentChatAuthor;
};

export function ProjectChatWidget() {
  const {
    chatOpen,
    setChatOpen,
    closeChat,
    chatMessages,
    currentChatAuthor,
    currentChatAuthorId,
    chatInput,
    setChatInput,
    submitChatMessage,
    hasMoreOlder,
    loadingMessages,
    loadingOlder,
    sending,
    loadOlderMessages,
  } = useProjectDetailModel();

  const scrollRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const skipAutoScrollRef = useRef(false);

  useEffect(() => {
    if (!chatOpen || loadingOlder || skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }

    if (!isNearBottomRef.current) {
      return;
    }

    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [chatMessages, chatOpen, loadingOlder, loadingMessages]);

  useEffect(() => {
    if (chatOpen && !loadingMessages) {
      isNearBottomRef.current = true;
    }
  }, [chatOpen, loadingMessages]);

  const handleScroll = async () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 48;

    if (container.scrollTop > 24 || !hasMoreOlder || loadingOlder) {
      return;
    }

    const previousScrollHeight = container.scrollHeight;
    skipAutoScrollRef.current = true;
    const loaded = await loadOlderMessages();

    if (!loaded) {
      return;
    }

    requestAnimationFrame(() => {
      if (!scrollRef.current) {
        return;
      }

      scrollRef.current.scrollTop = scrollRef.current.scrollHeight - previousScrollHeight;
    });
  };

  return (
    <>
      {chatOpen && (
        <Card
          title="Hộp chat"
          extra={<Button type="text" icon={<CloseOutlined />} onClick={closeChat} />}
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
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {loadingMessages ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : chatMessages.length ? (
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {loadingOlder && (
                  <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
                    <Spin size="small" />
                  </div>
                )}
                {!loadingOlder && hasMoreOlder && (
                  <div style={{ textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Cuộn lên để xem tin cũ hơn
                    </Text>
                  </div>
                )}

                {chatMessages.map((chat) => {
                  const ownMessage = isOwnMessage(chat, currentChatAuthorId, currentChatAuthor);

                  return (
                    <div
                      key={chat.id}
                      style={{
                        alignSelf: ownMessage ? "flex-end" : "flex-start",
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
                          background: ownMessage ? "#dcfce7" : "#f3f4f6",
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
                  );
                })}
              </Space>
            ) : (
              <Empty description="Chưa có tin nhắn" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>

          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onPressEnter={submitChatMessage}
              disabled={sending}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={submitChatMessage}
              loading={sending}
            />
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
