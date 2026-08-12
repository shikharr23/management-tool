import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDate, getStatusColor, getPriorityColor, isOverdue } from "../utils/helpers";

export default function TaskCard({ task, onDelete, onEdit, onView, isOverlay = false }) {
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

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`bg-white p-[15px] rounded-md shadow-xs border border-gray-100 border-l-[3px] cursor-grab touch-none ${
        overdue && !isOverlay ? "border-l-red-500" : "border-l-gray-900"
      } ${isDragging ? "opacity-40" : "opacity-100"}`}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
      onClick={() => {
        if (!isDragging && onView && !isOverlay) {
          onView(task);
        }
      }}
    >
      <div className="flex justify-between items-start mb-2.5 gap-2">
        <h4 className="m-0 text-[15px] font-bold flex-1 break-words text-gray-900">{task.title}</h4>
        {!isOverlay && (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              className="py-1 px-2 text-[11px] font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded hover:bg-gray-200 transition-all cursor-pointer"
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
              className="py-1 px-2 text-[11px] font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition-all cursor-pointer"
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
      {task.description && <p className="text-gray-600 text-[13px] my-2 leading-relaxed">{task.description}</p>}
      <div className="flex gap-1.5 mb-2.5 flex-wrap items-center">
        <span
          className="text-white py-1 px-2.5 rounded text-[11px] font-bold capitalize"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
        <span
          className="text-white py-1 px-2.5 rounded text-[11px] font-bold capitalize"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
        {task.assignedTo && (
          <span className="bg-gray-100 text-gray-700 py-1 px-2 rounded text-[11px] font-semibold border border-gray-200 inline-flex items-center gap-1" title="Assigned Member">
            👤 {(task.assignedTo.email || task.assignedTo.profile?.username || "Assigned").split("@")[0]}
          </span>
        )}
      </div>
      <p className={`text-xs m-0 ${overdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
        {formatDate(task.dueDate)}
        {overdue ? " (overdue)" : ""}
      </p>
    </div>
  );
}
