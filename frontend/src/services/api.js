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
