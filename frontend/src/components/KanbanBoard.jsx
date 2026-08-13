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
  review: { title: "Review", color: "#6366f1" },
  completed: { title: "Completed", color: "#10b981" },
};

function KanbanColumn({ status, title, color, tasks, onDeleteTask, onEditTask, onViewTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  const taskIds = tasks.map((t) => String(t._id));

  return (
    <div className="bg-[#fafafa] rounded-[10px] p-5 border border-[#e8e8e8] flex flex-col">
      <div className="flex justify-between items-center pb-[15px] mb-[15px] border-b-2" style={{ borderColor: color }}>
        <h3 className="m-0 text-base font-bold" style={{ color }}>{title}</h3>
        <span className="text-xs font-semibold text-gray-400 bg-white py-1 px-2.5 rounded-full min-w-[24px] text-center">{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-3 flex-1 min-h-[300px] rounded-lg transition-colors duration-150 ${
            isOver ? "bg-gray-200" : ""
          }`}
        >
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-10 px-5 text-sm flex-1 flex items-center justify-center pointer-events-none">Drop tasks here</p>
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
        onReorderTasks(updates, false);
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
      onReorderTasks(updates, true);
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
      <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-4 gap-5 min-h-[calc(100vh-250px)] pb-10">
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
          <div className="cursor-grabbing rotate-2">
            <TaskCard task={activeTask} onDelete={onDeleteTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
