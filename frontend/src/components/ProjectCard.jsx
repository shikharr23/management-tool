import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../utils/helpers";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const overdue = isOverdue(project.deadline);

  return (
    <div className="flex flex-col gap-2.5">
      <Link to={`/project/${project._id}`} className="flex-1 block no-underline text-inherit">
        <div className="bg-white p-6 rounded-lg shadow-xs border border-gray-100 transition-all duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2.5 tracking-tight">{project.name}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">{project.description}</p>
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <span className={`text-[13px] ${overdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
              {formatDate(project.deadline)}
              {overdue ? " (overdue)" : ""}
            </span>
            <span className="text-base text-gray-900 font-semibold">→</span>
          </div>
        </div>
      </Link>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 py-2 px-3 text-[13px] font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 transition-all cursor-pointer"
          onClick={() => onEdit(project)}
        >
          Edit
        </button>
        <button
          type="button"
          className="flex-1 py-2 px-3 text-[13px] font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-all cursor-pointer"
          onClick={() => onDelete(project._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
