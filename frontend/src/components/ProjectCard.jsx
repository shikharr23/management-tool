import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../utils/helpers";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const overdue = isOverdue(project.deadline);

  return (
    <div style={styles.wrapper}>
      <Link to={`/project/${project._id}`} style={styles.link}>
        <div style={styles.card}>
          <h3 style={styles.title}>{project.name}</h3>
          <p style={styles.description}>{project.description}</p>
          <div style={styles.footer}>
            <span style={{ ...styles.deadline, ...(overdue ? styles.overdue : {}) }}>
              {formatDate(project.deadline)}
              {overdue ? " (overdue)" : ""}
            </span>
            <span style={styles.arrow}>→</span>
          </div>
        </div>
      </Link>
      <div style={styles.actions}>
        <button
          type="button"
          className="secondary"
          style={styles.actionBtn}
          onClick={() => onEdit(project)}
        >
          Edit
        </button>
        <button
          type="button"
          className="danger"
          style={styles.actionBtn}
          onClick={() => onDelete(project._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1a1a1a",
  },
  description: {
    color: "#666666",
    fontSize: "14px",
    marginBottom: "16px",
    flex: 1,
    lineHeight: "1.5",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid #f0f0f0",
  },
  deadline: {
    fontSize: "13px",
    color: "#999999",
  },
  overdue: {
    color: "#ef4444",
    fontWeight: "600",
  },
  arrow: {
    fontSize: "16px",
    color: "#1a1a1a",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "13px",
  },
};
