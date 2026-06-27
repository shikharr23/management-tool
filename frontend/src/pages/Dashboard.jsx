import { useState, useEffect } from "react";
import { projectService } from "../services/api";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

const emptyForm = { name: "", description: "", deadline: "" };

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      name: project.name,
      description: project.description || "",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().split("T")[0]
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await projectService.update(editingId, formData);
      } else {
        await projectService.create(formData);
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Projects</h1>
            <p style={styles.subtitle}>{projects.length} projects</p>
          </div>
          <button
            className="primary"
            onClick={() => {
              if (showForm && !editingId) {
                resetForm();
              } else {
                setEditingId(null);
                setFormData(emptyForm);
                setShowForm(true);
              }
            }}
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.formTitle}>
              {editingId ? "Edit Project" : "New Project"}
            </h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Project Name</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />
            </div>
            <div style={styles.formButtons}>
              <button type="submit" className="primary">
                {editingId ? "Save Changes" : "Create Project"}
              </button>
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No projects yet.</p>
            <p style={styles.emptySubtext}>Create one to get started</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
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
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#999999",
    margin: 0,
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
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  textarea: {
    minHeight: "100px",
    resize: "vertical",
  },
  formButtons: {
    display: "flex",
    gap: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  error: {
    color: "#ef4444",
    padding: "16px",
    backgroundColor: "#fee2e2",
    borderRadius: "6px",
    marginBottom: "24px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#999999",
    margin: "8px 0 0 0",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#888888",
    fontSize: "16px",
  },
};
