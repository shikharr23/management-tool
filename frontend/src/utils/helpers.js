export const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const isOverdue = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const getStatusColor = (status) => {
  const colors = {
    todo: "#6b7280",
    "in-progress": "#3b82f6",
    completed: "#10b981",
  };
  return colors[status] || "#6b7280";
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
  };
  return colors[priority] || "#6b7280";
};
