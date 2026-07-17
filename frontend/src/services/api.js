const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const parseErrorMessage = (data) => {
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.error)) return data.error[0]?.message || "API Error";
  if (data.msg) return data.msg;
  return "API Error";
};

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    unauthorizedHandler?.();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseErrorMessage(data));
  }

  if (response.status === 204) return null;

  return response.json();
};

export const authService = {
  register: (name, email, password) =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => apiCall("/auth/me"),
};

export const projectService = {
  getAll: () => apiCall("/project"),
  getById: (id) => apiCall(`/project/${id}`),
  create: (data) =>
    apiCall("/project", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/project/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/project/${id}`, {
      method: "DELETE",
    }),
};

export const taskService = {
  getAll: (projectId) =>
    apiCall(projectId ? `/task?projectId=${projectId}` : "/task"),
  getById: (id) => apiCall(`/task/${id}`),
  create: (data) =>
    apiCall("/task", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/task/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/task/${id}`, {
      method: "DELETE",
    }),
};
