import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService } from "../services/api";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";
import TaskDetailModal from "../components/TaskDetailModal";
import ManageMembersModal from "../components/ManageMembersModal";
import ProjectSidebar from "../components/ProjectSidebar";

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState(emptyTaskForm);
  const [viewingTask, setViewingTask] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Sidebar & Filter states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsError(null);
      const data = await projectService.getStats(projectId);
      setStats(data);
    } catch (err) {
      setStatsError(err.message || "Failed to load analytics");
    }
  }, [projectId]);

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      const [projectData, taskResponse, membersResponse, statsData] = await Promise.all([
        projectService.getById(projectId),
        taskService.getAll({ projectId, limit: 200, sortBy: "order", order: "asc" }),
        projectService.getMembers(projectId).catch(() => ({ members: [] })),
        projectService.getStats(projectId).catch((err) => {
          setStatsError(err.message || "Failed to load analytics");
          return null;
        }),
      ]);
      setProject(projectData);
      setTasks(taskResponse.tasks || []);
      setMembers(membersResponse.members || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const resetForm = () => {
    setFormData(emptyTaskForm);
    setEditingTaskId(null);
    setShowTaskForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
    });
    setShowTaskForm(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        project: projectId,
        assignedTo: formData.assignedTo || undefined,
      };

      if (editingTaskId) {
        await taskService.update(editingTaskId, payload);
      } else {
        await taskService.create(payload);
      }
      resetForm();
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReorderTasks = async (updates, hasCrossColumnMove = false) => {
    setTasks((prevTasks) => {
      const updateMap = new Map(updates.map((u) => [String(u._id), u]));
      return prevTasks
        .map((task) => {
          const update = updateMap.get(String(task._id));
          return update
            ? { ...task, status: update.status, order: update.order }
            : task;
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    try {
      await taskService.reorder(projectId, updates);
      if (hasCrossColumnMove) {
        fetchStats();
      }
    } catch (err) {
      setError(err.message);
      fetchProjectAndTasks();
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      await taskService.update(taskId, updatedData);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...updatedData } : t))
      );
      fetchStats();
    } catch (err) {
      setError(err.message);
      fetchProjectAndTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter tasks based on search, priority, and assignee
  const filteredTasks = tasks.filter((task) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Priority Filter
    if (selectedPriority !== "all") {
      if (task.priority !== selectedPriority) return false;
    }

    // 3. Assignee Filter
    if (selectedAssignee !== null) {
      const assigneeId = task.assignedTo?._id || task.assignedTo;
      if (assigneeId !== selectedAssignee) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-medium">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-medium">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex w-full max-w-[1800px] mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 py-5 px-4 sm:px-[30px] pb-10 min-w-0">
          <div className="flex justify-between items-start mb-6 gap-5 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mb-3 text-[13px] py-2 px-3.5 bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 transition-all font-semibold cursor-pointer block"
              >
                ← Back to Projects
              </button>
              <h1 className="text-[28px] font-extrabold text-gray-900 mb-1.5 tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 text-sm leading-relaxed m-0">{project.description}</p>
              )}
            </div>

            <div className="flex gap-2.5 items-center flex-wrap">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="py-2 px-3.5 text-[13px] font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 transition-all cursor-pointer"
                title="Toggle Sidebar"
              >
                {isSidebarOpen ? "Hide Hub 📊" : "Show Hub 📊"}
              </button>

              <button
                type="button"
                onClick={() => setShowMembersModal(true)}
                className="py-2 px-3.5 text-[13px] font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 transition-all cursor-pointer"
              >
                👥 Members ({members.length})
              </button>

              <button
                type="button"
                className="py-2.5 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (showTaskForm && !editingTaskId) {
                    resetForm();
                  } else {
                    setEditingTaskId(null);
                    setFormData(emptyTaskForm);
                    setShowTaskForm(true);
                  }
                }}
              >
                + New Task
              </button>
            </div>
          </div>

          {/* Active Filter Pill indicator if any filter applied */}
          {(searchQuery || selectedPriority !== "all" || selectedAssignee !== null) && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-4 mb-5">
              <span className="text-[13px] text-blue-900">
                Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks matching filters
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPriority("all");
                  setSelectedAssignee(null);
                }}
                className="bg-transparent border-none text-blue-600 text-xs font-bold cursor-pointer underline hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}

          {showTaskForm && (
            <form onSubmit={handleSubmitTask} className="bg-white p-6 rounded-xl mb-[30px] flex flex-col gap-4 border border-gray-200 shadow-xs">
              <h2 className="text-lg font-semibold text-gray-900 m-0">
                {editingTaskId ? "Edit Task" : "New Task"}
              </h2>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-semibold text-gray-700">Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[13px] font-semibold text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all min-h-[70px] resize-y"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[13px] font-semibold text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[13px] font-semibold text-gray-700">Assign Member</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => {
                      const u = m.user || {};
                      return (
                        <option key={u._id || u} value={u._id || u}>
                          {u.email || "Member"} ({m.role || "member"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[13px] font-semibold text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer"
                >
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </button>
                <button
                  type="button"
                  className="py-2.5 px-5 text-sm font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 transition-all cursor-pointer"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && <p className="text-red-500 py-3 px-4 bg-red-100 rounded-md mb-5 text-sm border border-red-200">{error}</p>}

          <KanbanBoard
            tasks={filteredTasks}
            onUpdateTask={handleUpdateTask}
            onReorderTasks={handleReorderTasks}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onViewTask={handleViewTask}
          />

          {viewingTask && (
            <TaskDetailModal
              task={viewingTask}
              onClose={() => setViewingTask(null)}
            />
          )}

          {showMembersModal && (
            <ManageMembersModal
              projectId={project._id}
              onClose={() => {
                setShowMembersModal(false);
                fetchProjectAndTasks();
              }}
            />
          )}
        </main>

        {/* Project Sidebar / Hub Panel */}
        <ProjectSidebar
          project={project}
          members={members}
          tasks={tasks}
          stats={stats}
          statsLoading={statsLoading}
          statsError={statsError}
          onRetryStats={fetchStats}
          selectedAssignee={selectedAssignee}
          onSelectAssignee={setSelectedAssignee}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          onOpenManageMembers={() => setShowMembersModal(true)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}
