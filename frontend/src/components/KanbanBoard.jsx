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
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const COLUMNS = {
  todo: { title: "Todo", color: "#888888" },
  "in-progress": { title: "In Progress", color: "#1a1a1a" },
  completed: { title: "Completed", color: "#10b981" },
};

function KanbanColumn({ status, title, color, tasks, onDeleteTask, onEditTask, onViewTask }) {
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
                onView={onViewTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({
  tasks,
  onUpdateTask,
  onReorderTasks,
  onDeleteTask,
  onEditTask,
  onViewTask,
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const getTasksByStatus = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDragStart = (event) => {
    const task = tasks.find((t) => String(t._id) === String(event.active.id));
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const draggedTask = tasks.find((t) => String(t._id) === activeId);
    if (!draggedTask) return;

    const sourceStatus = draggedTask.status;

    let destinationStatus = null;
    let targetTask = null;

    if (overId.startsWith("column-")) {
      destinationStatus = overId.replace("column-", "");
    } else {
      targetTask = tasks.find((t) => String(t._id) === overId);
      if (targetTask) {
        destinationStatus = targetTask.status;
      }
    }

    if (!destinationStatus || !COLUMNS[destinationStatus]) return;

    // Case 1: Reordering within the same column
    if (sourceStatus === destinationStatus) {
      const columnTasks = getTasksByStatus(sourceStatus);
      const oldIndex = columnTasks.findIndex((t) => String(t._id) === activeId);
      const newIndex = targetTask
        ? columnTasks.findIndex((t) => String(t._id) === overId)
        : columnTasks.length - 1;

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
      const updates = reorderedColumnTasks.map((t, index) => ({
        _id: t._id,
        status: sourceStatus,
        order: index,
      }));

      if (onReorderTasks) {
        onReorderTasks(updates);
      } else if (onUpdateTask) {
        onUpdateTask(draggedTask._id, { order: newIndex });
      }
      return;
    }

    // Case 2: Moving across columns
    const sourceColumnTasks = getTasksByStatus(sourceStatus).filter(
      (t) => String(t._id) !== activeId
    );
    const destColumnTasks = getTasksByStatus(destinationStatus);

    let targetIndex = destColumnTasks.length;
    if (targetTask) {
      const overIndex = destColumnTasks.findIndex((t) => String(t._id) === overId);
      if (overIndex !== -1) {
        targetIndex = overIndex;
      }
    }

    const updatedDraggedTask = {
      ...draggedTask,
      status: destinationStatus,
    };

    const newDestColumnTasks = [
      ...destColumnTasks.slice(0, targetIndex),
      updatedDraggedTask,
      ...destColumnTasks.slice(targetIndex),
    ];

    const sourceUpdates = sourceColumnTasks.map((t, index) => ({
      _id: t._id,
      status: sourceStatus,
      order: index,
    }));

    const destUpdates = newDestColumnTasks.map((t, index) => ({
      _id: t._id,
      status: destinationStatus,
      order: index,
    }));

    const updates = [...sourceUpdates, ...destUpdates];

    if (onReorderTasks) {
      onReorderTasks(updates);
    } else if (onUpdateTask) {
      onUpdateTask(draggedTask._id, {
        status: destinationStatus,
        order: targetIndex,
      });
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
            onViewTask={onViewTask}
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
