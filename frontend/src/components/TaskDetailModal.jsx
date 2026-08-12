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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
          <h2 className="m-0 text-xl font-bold text-gray-900">{task.title}</h2>
          <button
            type="button"
            className="bg-transparent border-none text-xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors p-1 leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-5 border-b border-gray-100">
          <p className="m-0 mb-5 text-gray-700 text-sm leading-relaxed">{task.description || "No description provided."}</p>
          
          <div className="flex gap-5 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <strong className="font-semibold">Status:</strong>
              <span
                className="text-white py-1 px-2.5 rounded text-xs font-bold capitalize"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <strong className="font-semibold">Priority:</strong>
              <span
                className="text-white py-1 px-2.5 rounded text-xs font-bold capitalize"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <strong className="font-semibold">Due Date:</strong>
              <span className={overdue ? "text-red-500 font-semibold" : "text-gray-600"}>
                {formatDate(task.dueDate)} {overdue ? "(overdue)" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1 overflow-hidden">
          <h3 className="m-0 mb-3.5 text-base font-semibold text-gray-900">Comments</h3>
          
          {error && <p className="text-red-500 text-sm mb-2.5">{error}</p>}
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 mb-3.5 pr-2.5">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <strong className="font-semibold text-gray-800">{comment.user.name}</strong>
                    <span className="text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="m-0 text-sm text-gray-800 leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2.5 mt-auto pt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
