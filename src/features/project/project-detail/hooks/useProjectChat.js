import { useCallback, useEffect, useRef, useState } from "react";

import { getProjectChatMessages } from "@/utils/api";

const CHAT_PAGE_SIZE = 10;

const sortChatMessages = (messages = []) =>
  [...messages].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

const mergeChatMessages = (existing = [], incoming = []) => {
  const byId = new Map(existing.map((message) => [message.id, message]));
  incoming.forEach((message) => {
    byId.set(message.id, message);
  });
  return sortChatMessages([...byId.values()]);
};

const mergeNewChatFromServer = (local = [], serverMessages = []) => {
  if (!local.length) {
    return local;
  }

  const localIds = new Set(local.map((message) => message.id));
  const newestLocalTime = Math.max(
    ...local.map((message) => new Date(message.createdAt).getTime()),
  );

  const incoming = serverMessages.filter((message) => {
    if (localIds.has(message.id)) {
      return false;
    }
    return new Date(message.createdAt).getTime() >= newestLocalTime;
  });

  if (!incoming.length) {
    return local;
  }

  return mergeChatMessages(local, incoming);
};

export function useProjectChat({
  projectId,
  projectChatMessages,
  saveProject,
  currentChatAuthor,
  currentChatAuthorId,
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);

  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;

  const hasMoreOlderRef = useRef(hasMoreOlder);
  hasMoreOlderRef.current = hasMoreOlder;

  const loadingOlderRef = useRef(loadingOlder);
  loadingOlderRef.current = loadingOlder;

  const loadInitialMessages = useCallback(async () => {
    setLoadingMessages(true);

    try {
      const data = await getProjectChatMessages(projectId, { limit: CHAT_PAGE_SIZE });
      setChatMessages(sortChatMessages(data.messages ?? []));
      setHasMoreOlder(Boolean(data.hasMore));
    } catch {
      setChatMessages([]);
      setHasMoreOlder(false);
    } finally {
      setLoadingMessages(false);
    }
  }, [projectId]);

  const loadOlderMessages = useCallback(async () => {
    const oldestId = chatMessagesRef.current[0]?.id;
    if (!oldestId || !hasMoreOlderRef.current || loadingOlderRef.current) {
      return false;
    }

    setLoadingOlder(true);

    try {
      const data = await getProjectChatMessages(projectId, {
        limit: CHAT_PAGE_SIZE,
        before: oldestId,
      });
      setChatMessages((current) => mergeChatMessages(data.messages ?? [], current));
      setHasMoreOlder(Boolean(data.hasMore));
      return true;
    } catch {
      return false;
    } finally {
      setLoadingOlder(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    loadInitialMessages();
  }, [chatOpen, loadInitialMessages]);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    setChatMessages((current) => mergeNewChatFromServer(current, projectChatMessages ?? []));
  }, [chatOpen, projectChatMessages]);

  const closeChat = () => {
    setChatOpen(false);
    setChatMessages([]);
    setHasMoreOlder(false);
  };

  const submitChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || sending) {
      return;
    }

    setSending(true);

    try {
      const nextMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: currentChatAuthor,
        authorId: currentChatAuthorId || "",
        text,
        createdAt: new Date().toISOString(),
      };

      const updated = await saveProject(
        (fresh) => ({
          chatMessages: [...(fresh.chatMessages ?? []), nextMessage],
        }),
        null,
      );

      if (updated) {
        const savedMessages = updated.chatMessages ?? [];
        const savedMessage = savedMessages.find((message) => message.id === nextMessage.id);
        setChatMessages((current) =>
          mergeChatMessages(current, savedMessage ? [savedMessage] : [nextMessage]),
        );
        setChatInput("");
      }
    } finally {
      setSending(false);
    }
  };

  return {
    chatOpen,
    setChatOpen,
    closeChat,
    chatInput,
    setChatInput,
    chatMessages,
    hasMoreOlder,
    loadingMessages,
    loadingOlder,
    sending,
    loadOlderMessages,
    submitChatMessage,
    currentChatAuthorId,
  };
};
