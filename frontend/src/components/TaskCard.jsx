import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDate, getStatusColor, getPriorityColor, isOverdue } from "../utils/helpers";

export default function TaskCard({ task, onDelete, onEdit, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task._id),
    disabled: isOverlay,
  });

  const overdue = isOverdue(task.dueDate);

  const style = {
    ...styles.card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: "none",
    ...(overdue && !isOverlay ? styles.overdueCard : {}),
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      <div style={styles.header}>
        <h4 style={styles.title}>{task.title}</h4>
        {!isOverlay && (
          <div style={styles.actions}>
            <button
              type="button"
              className="secondary"
              style={styles.iconBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="danger"
              style={styles.iconBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {task.description && <p style={styles.description}>{task.description}</p>}
      <div style={styles.footer}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: getStatusColor(task.status),
          }}
        >
          {task.status}
        </span>
        <span
          style={{
            ...styles.badge,
            backgroundColor: getPriorityColor(task.priority),
          }}
        >
          {task.priority}
        </span>
      </div>
      <p style={{ ...styles.dueDate, ...(overdue ? styles.overdueText : {}) }}>
        {formatDate(task.dueDate)}
        {overdue ? " (overdue)" : ""}
      </p>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f0f0f0",
    borderLeft: "3px solid #1a1a1a",
    cursor: "grab",
  },
  overdueCard: {
    borderLeftColor: "#ef4444",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "10px",
    gap: "8px",
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    flex: 1,
    wordBreak: "break-word",
    color: "#1a1a1a",
  },
  actions: {
    display: "flex",
    gap: "4px",
    flexShrink: 0,
  },
  iconBtn: {
    padding: "4px 8px",
    fontSize: "11px",
  },
  description: {
    color: "#666666",
    fontSize: "13px",
    margin: "8px 0",
    lineHeight: "1.4",
  },
  footer: {
    display: "flex",
    gap: "6px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  badge: {
    color: "white",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dueDate: {
    fontSize: "12px",
    color: "#999999",
    margin: 0,
  },
  overdueText: {
    color: "#ef4444",
    fontWeight: "600",
  },
};
