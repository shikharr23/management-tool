const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let unauthorizedHandler = null;
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const parseErrorMessage = (data) => {
  if (typeof data.error === "string") return data.error;
  if(typeof data.message === "string") return data.message;
  if (Array.isArray(data.error)) return data.error[0]?.message || "Validation Error";
  if (typeof data.msg === "string") return data.msg;
  return "API Error";
};

export const apiCall = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && endpoint !== "/auth/refresh" && endpoint !== "/auth/login") {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          return apiCall(endpoint, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
          });
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new Error("Session expired");
      }

      const { accessToken: newAccessToken } = await refreshResponse.json();
      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      // Retry original request
      return apiCall(endpoint, options);
    } catch (err) {
      processQueue(err, null);
      setAccessToken(null);
      unauthorizedHandler?.();
      throw new Error("Session expired. Please log in again.");
    } finally {
      isRefreshing = false;
    }
  }

  if (response.status === 401) {
    setAccessToken(null);
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
  refresh: () => apiCall("/auth/refresh", { method: "POST" }),
  logout: () => apiCall("/auth/logout", { method: "POST" }),
  getMe: () => apiCall("/auth/me"),
  searchUsers: (email) => apiCall(`/auth/search?email=${encodeURIComponent(email)}`),
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
  getMembers: (id) => apiCall(`/project/${id}/members`),
  addMember: (id, userId, role) =>
    apiCall(`/project/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    }),
  updateMemberRole: (id, userId, role) =>
    apiCall(`/project/${id}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (id, userId) =>
    apiCall(`/project/${id}/members/${userId}`, {
      method: "DELETE",
    }),
  getStats: (id) => apiCall(`/project/${id}/stats`),
};

export const taskService = {
  // params: { projectId, page, limit, status, priority, search, sortBy, order }
  // Returns: { tasks: [...], pagination: { page, limit, total, pages, hasNextPage, hasPrevPage } }
  getAll: (projectIdOrParams) => {
    // Backwards compatible: if a plain string is passed, treat it as projectId
    const params =
      typeof projectIdOrParams === "string"
        ? { projectId: projectIdOrParams }
        : projectIdOrParams || {};

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const queryString = query.toString();
    return apiCall(`/task${queryString ? `?${queryString}` : ""}`);
  },
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
  getComments: (id) => apiCall(`/task/${id}/comments`),
  addComment: (id, text) =>
    apiCall(`/task/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  reorder: (projectId, tasks) =>
    apiCall("/task/reorder", {
      method: "PATCH",
      body: JSON.stringify({ projectId, tasks }),
    }),
};
