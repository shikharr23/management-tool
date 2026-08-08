import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService } from "../services/api";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";
import TaskDetailModal from "../components/TaskDetailModal";
import ManageMembersModal from "../components/ManageMembersModal";
import ProjectSidebar from "../components/ProjectSidebar";

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState(emptyTaskForm);
  const [viewingTask, setViewingTask] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Sidebar & Filter states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      const [projectData, taskResponse, membersResponse] = await Promise.all([
        projectService.getById(projectId),
        taskService.getAll({ projectId, limit: 200 }),
        projectService.getMembers(projectId).catch(() => ({ members: [] })),
      ]);
      setProject(projectData);
      setTasks(taskResponse.tasks || []);
      setMembers(membersResponse.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const resetForm = () => {
    setFormData(emptyTaskForm);
    setEditingTaskId(null);
    setShowTaskForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
    });
    setShowTaskForm(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        project: projectId,
        assignedTo: formData.assignedTo || undefined,
      };

      if (editingTaskId) {
        await taskService.update(editingTaskId, payload);
      } else {
        await taskService.create(payload);
      }
      resetForm();
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      await taskService.update(taskId, updatedData);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...updatedData } : t))
      );
    } catch (err) {
      setError(err.message);
      fetchProjectAndTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter tasks based on search, priority, and assignee
  const filteredTasks = tasks.filter((task) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Priority Filter
    if (selectedPriority !== "all") {
      if (task.priority !== selectedPriority) return false;
    }

    // 3. Assignee Filter
    if (selectedAssignee !== null) {
      const assigneeId = task.assignedTo?._id || task.assignedTo;
      if (assigneeId !== selectedAssignee) return false;
    }

    return true;
  });

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (!project) return <p style={styles.error}>Project not found</p>;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.layout}>
        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <button
                className="secondary"
                onClick={() => navigate("/dashboard")}
                style={styles.backBtn}
              >
                ← Back to Projects
              </button>
              <h1 style={styles.title}>{project.name}</h1>
              {project.description && (
                <p style={styles.description}>{project.description}</p>
              )}
            </div>

            <div style={styles.headerActions}>
              <button
                className="secondary"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                style={styles.sidebarToggleBtn}
                title="Toggle Sidebar"
              >
                {isSidebarOpen ? "Hide Hub 📊" : "Show Hub 📊"}
              </button>

              <button
                className="secondary"
                onClick={() => setShowMembersModal(true)}
                style={styles.manageBtn}
              >
                👥 Members ({members.length})
              </button>

              <button
                className="primary"
                onClick={() => {
                  if (showTaskForm && !editingTaskId) {
                    resetForm();
                  } else {
                    setEditingTaskId(null);
                    setFormData(emptyTaskForm);
                    setShowTaskForm(true);
                  }
                }}
              >
                + New Task
              </button>
            </div>
          </div>

          {/* Active Filter Pill indicator if any filter applied */}
          {(searchQuery || selectedPriority !== "all" || selectedAssignee !== null) && (
            <div style={styles.filterBanner}>
              <span style={styles.filterBannerText}>
                Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks matching filters
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPriority("all");
                  setSelectedAssignee(null);
                }}
                style={styles.clearAllFiltersBtn}
              >
                Clear all filters
              </button>
            </div>
          )}

          {showTaskForm && (
            <form onSubmit={handleSubmitTask} style={styles.form}>
              <h2 style={styles.formTitle}>
                {editingTaskId ? "Edit Task" : "New Task"}
              </h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={styles.textarea}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign Member</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => {
                      const u = m.user || {};
                      return (
                        <option key={u._id || u} value={u._id || u}>
                          {u.email || "Member"} ({m.role || "member"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div style={styles.formButtons}>
                <button type="submit" className="primary">
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </button>
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && <p style={styles.errorMsg}>{error}</p>}

          <KanbanBoard
            tasks={filteredTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onViewTask={handleViewTask}
          />

          {viewingTask && (
            <TaskDetailModal
              task={viewingTask}
              onClose={() => setViewingTask(null)}
            />
          )}

          {showMembersModal && (
            <ManageMembersModal
              projectId={project._id}
              onClose={() => {
                setShowMembersModal(false);
                fetchProjectAndTasks();
              }}
            />
          )}
        </main>

        {/* Project Sidebar / Hub Panel */}
        <ProjectSidebar
          project={project}
          members={members}
          tasks={tasks}
          selectedAssignee={selectedAssignee}
          onSelectAssignee={setSelectedAssignee}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          onOpenManageMembers={() => setShowMembersModal(true)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  layout: {
    display: "flex",
    width: "100%",
    maxWidth: "1800px",
    margin: "0 auto",
  },
  mainContent: {
    flex: 1,
    padding: "20px 30px 40px 30px",
    minWidth: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "20px",
    flexWrap: "wrap",
  },
  headerContent: {
    flex: 1,
    minWidth: "280px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  manageBtn: {
    padding: "10px 14px",
    fontSize: "13px",
  },
  sidebarToggleBtn: {
    padding: "10px 14px",
    fontSize: "13px",
  },
  backBtn: {
    marginBottom: "12px",
    fontSize: "13px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 6px 0",
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  description: {
    color: "#4b5563",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },
  filterBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "10px 16px",
    marginBottom: "20px",
  },
  filterBannerText: {
    fontSize: "13px",
    color: "#1e40af",
  },
  clearAllFiltersBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "underline",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
  },
  form: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  textarea: {
    minHeight: "70px",
    resize: "vertical",
  },
  formButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  errorMsg: {
    color: "#ef4444",
    padding: "12px 16px",
    backgroundColor: "#fee2e2",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#888888",
    fontSize: "16px",
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "16px",
  },
};
