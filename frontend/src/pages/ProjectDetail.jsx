import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService } from "../services/api";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState(emptyTaskForm);

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      const [projectData, projectTasks] = await Promise.all([
        projectService.getById(projectId),
        taskService.getAll(projectId),
      ]);
      setProject(projectData);
      setTasks(projectTasks);
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
    });
    setShowTaskForm(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await taskService.update(editingTaskId, formData);
      } else {
        await taskService.create({ ...formData, project: projectId });
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

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (!project) return <p style={styles.error}>Project not found</p>;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
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
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "0 30px 40px 30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "40px",
    gap: "20px",
  },
  headerContent: {
    flex: 1,
  },
  backBtn: {
    marginBottom: "12px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#1a1a1a",
  },
  description: {
    color: "#666666",
    fontSize: "15px",
    margin: 0,
    lineHeight: "1.5",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
  },
  form: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  textarea: {
    minHeight: "80px",
    resize: "vertical",
  },
  formButtons: {
    display: "flex",
    gap: "12px",
  },
  errorMsg: {
    color: "#ef4444",
    padding: "16px",
    backgroundColor: "#fee2e2",
    borderRadius: "6px",
    marginBottom: "24px",
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
