import { useState, useEffect } from "react";
import { taskService } from "../services/api";
import { formatDate, getStatusColor, getPriorityColor, isOverdue } from "../utils/helpers";

export default function TaskDetailModal({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await taskService.getComments(task._id);
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [task._id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await taskService.addComment(task._id, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  const overdue = isOverdue(task.dueDate);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{task.title}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.details}>
          <p style={styles.description}>{task.description || "No description provided."}</p>
          
          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <strong>Status:</strong>
              <span style={{ ...styles.badge, backgroundColor: getStatusColor(task.status) }}>
                {task.status}
              </span>
            </div>
            <div style={styles.metaItem}>
              <strong>Priority:</strong>
              <span style={{ ...styles.badge, backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority}
              </span>
            </div>
            <div style={styles.metaItem}>
              <strong>Due Date:</strong>
              <span style={{ ...(overdue ? styles.overdueText : {}) }}>
                {formatDate(task.dueDate)} {overdue ? "(overdue)" : ""}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.commentsSection}>
          <h3 style={styles.commentsTitle}>Comments</h3>
          
          {error && <p style={styles.errorMsg}>{error}</p>}
          
          <div style={styles.commentsList}>
            {loading ? (
              <p style={styles.loadingMsg}>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p style={styles.emptyMsg}>No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} style={styles.comment}>
                  <div style={styles.commentHeader}>
                    <strong>{comment.user.name}</strong>
                    <span style={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={styles.commentText}>{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} style={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={styles.commentInput}
            />
            <button type="submit" className="primary" disabled={!newComment.trim()}>
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#666",
  },
  details: {
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
  },
  description: {
    margin: "0 0 20px 0",
    color: "#444",
    lineHeight: "1.5",
  },
  meta: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  badge: {
    color: "white",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  overdueText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  commentsSection: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  commentsTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "600",
  },
  commentsList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "15px",
    paddingRight: "10px",
  },
  comment: {
    backgroundColor: "#f9f9f9",
    padding: "12px",
    borderRadius: "6px",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    fontSize: "13px",
  },
  commentTime: {
    color: "#888",
    fontSize: "12px",
  },
  commentText: {
    margin: 0,
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.4",
  },
  commentForm: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  commentInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  loadingMsg: {
    color: "#666",
    fontSize: "14px",
  },
  emptyMsg: {
    color: "#888",
    fontSize: "14px",
    fontStyle: "italic",
  },
  errorMsg: {
    color: "#ef4444",
    marginBottom: "10px",
    fontSize: "14px",
  },
};
