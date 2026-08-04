const BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const assertBaseUrl = () => {
  if (!BASE_URL) {
    throw new Error(
      "Chưa cấu hình VITE_API_URL. Thêm vào FE/.env: VITE_API_URL=http://localhost:5000/api",
    );
  }
};

const apiFetch = async (path, options) => {
  assertBaseUrl();
  try {
    return await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new Error(
      "Không kết nối được API. Kiểm tra backend đang chạy (npm run dev trong BE) và VITE_API_URL.",
    );
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const parseJson = async (res, { skipAuthRedirect = false } = {}) => {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.ok ? "Phản hồi API không hợp lệ" : `Lỗi máy chủ (${res.status})`,
    );
  }

  if (!res.ok) {
    const isUnauthorized =
      !skipAuthRedirect && (await handleUnauthorized(res));
    throw new Error(
      data.error || (isUnauthorized ? "Phiên đăng nhập hết hạn" : "Yêu cầu thất bại"),
    );
  }

  return data;
};

export const login = async (username, password) => {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return parseJson(res, { skipAuthRedirect: true });
};

export const requestPasswordOtp = async (email) => {
  const res = await apiFetch("/auth/request-password-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseJson(res);
};

export const verifyPasswordOtp = async (email, otp) => {
  const res = await apiFetch("/auth/verify-password-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return parseJson(res);
};

export const resetPasswordWithOtp = async (resetToken, newPassword) => {
  const res = await apiFetch("/auth/reset-password-with-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });

  return parseJson(res);
};

export const getEmployees = async ({ page, limit, search, all, excludeIds } = {}) => {
  const params = new URLSearchParams();
  if (all) {
    params.set("all", "true");
  } else {
    if (page != null) params.set("page", String(page));
    if (limit != null) params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (excludeIds?.length) {
      params.set("excludeIds", excludeIds.join(","));
    }
  }

  const query = params.toString();
  const res = await apiFetch(`/employees${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });
  const data = await parseJson(res);

  if (Array.isArray(data)) {
    if (all) {
      return data;
    }
    return {
      items: data,
      total: data.length,
      page: 1,
      limit: data.length || 1,
    };
  }

  return data;
};

export const getEmployee = async (id) => {
  const res = await apiFetch(`/employees/${id}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const addEmployee = async (formData) => {
  const res = await apiFetch("/employees", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  return parseJson(res);
};

export const updateEmployee = async (id, formData) => {
  const res = await apiFetch(`/employees/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
  return parseJson(res);
};

export const deleteEmployee = async (id) => {
  const res = await apiFetch(`/employees/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseJson(res);
};

export const getPartners = async ({ page, limit, search } = {}) => {
  const params = new URLSearchParams();
  if (page != null) params.set("page", String(page));
  if (limit != null) params.set("limit", String(limit));
  if (search) params.set("search", search);

  const query = params.toString();
  const res = await apiFetch(`/partners${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });
  const data = await parseJson(res);

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      limit: data.length || 1,
    };
  }

  return data;
};

export const addPartner = async (data) => {
  const res = await apiFetch("/partners", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return parseJson(res);
};

export const updatePartner = async (id, data) => {
  const res = await apiFetch(`/partners/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return parseJson(res);
};

export const deletePartner = async (id) => {
  const res = await apiFetch(`/partners/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const getProjects = async () => {
  const res = await apiFetch("/projects", {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const getProject = async (id) => {
  const res = await apiFetch(`/projects/${id}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const getProjectChatMessages = async (projectId, { limit = 10, before, after } = {}) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (before) {
    params.set("before", before);
  }
  if (after) {
    params.set("after", after);
  }

  const res = await apiFetch(`/projects/${projectId}/chat-messages?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const addProject = async (data) => {
  const res = await apiFetch("/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return parseJson(res);
};

export const updateProject = async (id, data) => {
  const res = await apiFetch(`/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return parseJson(res);
};

export const deleteProject = async (id) => {
  const res = await apiFetch(`/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const uploadProjectFiles = async (id, formData) => {
  const res = await apiFetch(`/projects/${id}/files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const deleteProjectFile = async (projectId, fileId) => {
  const res = await apiFetch(`/projects/${projectId}/files/${fileId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const uploadTaskFiles = async (projectId, taskId, formData) => {
  const res = await apiFetch(`/projects/${projectId}/tasks/${taskId}/files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const uploadTaskSubmissionFiles = async (projectId, taskId, formData) => {
  const res = await apiFetch(`/projects/${projectId}/tasks/${taskId}/submission-files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const deleteTaskFile = async (projectId, taskId, fileId, scope = "files") => {
  const res = await apiFetch(
    `/projects/${projectId}/tasks/${taskId}/files/${fileId}?scope=${scope}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  return parseJson(res);
};
