import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const COLUMNS = {
  todo: { title: "Todo", color: "#888888" },
  "in-progress": { title: "In Progress", color: "#1a1a1a" },
  completed: { title: "Completed", color: "#10b981" },
};

function KanbanColumn({ status, title, color, tasks, onDeleteTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  const taskIds = tasks.map((t) => String(t._id));

  return (
    <div style={styles.column}>
      <div style={{ ...styles.columnHeader, borderColor: color }}>
        <h3 style={{ ...styles.columnTitle, color }}>{title}</h3>
        <span style={styles.taskCount}>{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{
            ...styles.taskList,
            ...(isOver ? styles.taskListOver : {}),
          }}
        >
          {tasks.length === 0 ? (
            <p style={styles.emptyColumn}>Drop tasks here</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => String(t._id) === String(event.active.id));
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const draggedTask = tasks.find((t) => String(t._id) === String(active.id));
    if (!draggedTask) return;

    let newStatus = null;
    const overId = String(over.id);

    if (overId.startsWith("column-")) {
      newStatus = overId.replace("column-", "");
    } else {
      const overTask = tasks.find((t) => String(t._id) === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (
      newStatus &&
      Object.keys(COLUMNS).includes(newStatus) &&
      draggedTask.status !== newStatus
    ) {
      onUpdateTask(draggedTask._id, { status: newStatus });
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-board" style={styles.kanban}>
        {Object.entries(COLUMNS).map(([status, { title, color }]) => (
          <KanbanColumn
            key={status}
            status={status}
            title={title}
            color={color}
            tasks={getTasksByStatus(status)}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div style={styles.overlay}>
            <TaskCard task={activeTask} onDelete={onDeleteTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const styles = {
  kanban: {
    minHeight: "calc(100vh - 250px)",
    paddingBottom: "40px",
  },
  column: {
    backgroundColor: "#fafafa",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #e8e8e8",
    display: "flex",
    flexDirection: "column",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "15px",
    marginBottom: "15px",
    borderBottom: "2px solid",
  },
  columnTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
  },
  taskCount: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#888888",
    backgroundColor: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    minWidth: "24px",
    textAlign: "center",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
    minHeight: "300px",
    borderRadius: "8px",
    transition: "background-color 0.15s ease",
  },
  taskListOver: {
    backgroundColor: "#f0f0f0",
  },
  emptyColumn: {
    color: "#ccc",
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "14px",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  overlay: {
    cursor: "grabbing",
    transform: "rotate(2deg)",
  },
};
