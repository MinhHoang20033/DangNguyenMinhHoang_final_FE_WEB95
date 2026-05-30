const BASE_URL = import.meta.env.VITE_API_URL;

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

const parseJson = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const isUnauthorized = await handleUnauthorized(res);
    if (!isUnauthorized) {
      throw new Error(data.error || "Request failed");
    }
  }
  return data;
};

// ===== AUTH =====
export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return parseJson(res);
};

export const requestPasswordOtp = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/request-password-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseJson(res);
};

export const verifyPasswordOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/auth/verify-password-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return parseJson(res);
};

export const resetPasswordWithOtp = async (resetToken, newPassword) => {
  const res = await fetch(`${BASE_URL}/auth/reset-password-with-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });

  return parseJson(res);
};

// ===== EMPLOYEES =====
export const getEmployees = async ({ page, limit, search, all } = {}) => {
  const params = new URLSearchParams();
  if (all) {
    params.set("all", "true");
  } else {
    if (page != null) params.set("page", String(page));
    if (limit != null) params.set("limit", String(limit));
    if (search) params.set("search", search);
  }

  const query = params.toString();
  const res = await fetch(`${BASE_URL}/employees${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const getEmployee = async (id) => {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};


export const addEmployee = async (formData) => {
  const res = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData 
  });
  return parseJson(res);
};


export const updateEmployee = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData 
  });
  return parseJson(res);
};

export const deleteEmployee = async (id) => {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseJson(res);
};

// ===== PARTNERS =====
export const getPartners = async () => {
  const res = await fetch(`${BASE_URL}/partners`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const addPartner = async (data) => {
  const res = await fetch(`${BASE_URL}/partners`, {
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
  const res = await fetch(`${BASE_URL}/partners/${id}`, {
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
  const res = await fetch(`${BASE_URL}/partners/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

// ===== PROJECTS =====
export const getProjects = async () => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const getProject = async (id) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

// (project chưa cần upload → giữ JSON)
export const addProject = async (data) => {
  const res = await fetch(`${BASE_URL}/projects`, {
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
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
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
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseJson(res);
};

export const uploadProjectFiles = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/projects/${id}/files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const uploadTaskFiles = async (projectId, taskId, formData) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}/files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const uploadTaskSubmissionFiles = async (projectId, taskId, formData) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}/submission-files`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseJson(res);
};

export const deleteTaskFile = async (projectId, taskId, fileId, scope = "files") => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}/files/${fileId}?scope=${scope}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseJson(res);
};

export const deleteProjectFile = async (projectId, fileId) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/files/${fileId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseJson(res);
};
