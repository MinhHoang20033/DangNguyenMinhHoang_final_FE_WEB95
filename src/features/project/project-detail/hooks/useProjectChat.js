import { useState } from "react";

const DEFAULT_WELCOME_MESSAGE = {
  id: "system-welcome",
  author: "Hệ thống",
  text: "Xin chào, đây là hộp chat nhanh cho người dùng trong trang chi tiết dự án.",
  createdAt: new Date().toISOString(),
};

export function useProjectChat({ project, saveProject, currentChatAuthor }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const chatMessages = project?.chatMessages?.length
    ? project.chatMessages
    : [DEFAULT_WELCOME_MESSAGE];

  const submitChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) {
      return;
    }

    const nextMessage = {
      id: String(Date.now()),
      author: currentChatAuthor,
      text,
      createdAt: new Date().toISOString(),
    };

    const updated = await saveProject(
      (fresh) => ({
        chatMessages: [...(fresh.chatMessages ?? []), nextMessage],
      }),
      "Đã lưu tin nhắn",
    );

    if (updated) {
      setChatInput("");
    }
  };

  return {
    chatOpen,
    setChatOpen,
    chatInput,
    setChatInput,
    chatMessages,
    submitChatMessage,
  };
}
