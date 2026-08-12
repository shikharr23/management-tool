import { useState } from "react";

export default function ProjectSidebar({
  project,
  members = [],
  tasks = [],
  selectedAssignee,
  onSelectAssignee,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onSelectPriority,
  onOpenManageMembers,
  isOpen,
  onToggle,
}) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === "completed") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const priorities = ["all", "high", "medium", "low"];

  const getInitials = (email = "") => {
    return email.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <aside
      className={`bg-white border-l border-gray-200 h-[calc(100vh-70px)] sticky top-[70px] overflow-y-auto transition-all duration-300 ease-in-out shadow-xs shrink-0 ${
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="p-5 flex flex-col gap-4.5 min-w-[320px]">
        {/* Toggle / Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="m-0 text-base font-bold text-gray-900">Project Hub</h3>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="bg-transparent border-none text-[22px] cursor-pointer text-gray-400 hover:text-gray-700 leading-none p-1"
            title="Close Sidebar"
          >
            &times;
          </button>
        </div>

        {/* Quick Progress Analytics Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Progress</span>
            <span className="text-base font-bold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-400 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center flex flex-col">
              <span className="text-base font-bold text-gray-900">{totalTasks}</span>
              <span className="text-[11px] text-gray-500">Total</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center flex flex-col">
              <span className="text-base font-bold text-emerald-500">{completedTasks}</span>
              <span className="text-[11px] text-gray-500">Done</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center flex flex-col">
              <span className={`text-base font-bold ${overdueCount > 0 ? "text-red-500" : "text-gray-600"}`}>
                {overdueCount}
              </span>
              <span className="text-[11px] text-gray-500">Overdue</span>
            </div>
          </div>
        </div>

        {/* Task Search & Filter Controls */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Search & Filters</span>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg py-1.5 px-2.5 gap-2">
            <span className="text-[13px] text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-none outline-none w-full text-[13px] bg-transparent text-gray-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="bg-transparent border-none text-gray-400 hover:text-gray-600 cursor-pointer text-base p-0"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Priority:</span>
            <div className="flex gap-1.5 flex-wrap">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => onSelectPriority(p)}
                  className={`py-1 px-2.5 text-xs rounded-full border cursor-pointer capitalize transition-all ${
                    selectedPriority === p
                      ? "bg-gray-900 text-white border-gray-900 font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Team Members</span>
              <span className="text-[11px] font-bold bg-gray-200 text-gray-700 py-px px-2 rounded-full">{members.length}</span>
            </div>
            <button
              type="button"
              onClick={onOpenManageMembers}
              className="bg-transparent border-none text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer p-0"
            >
              + Manage
            </button>
          </div>

          <p className="text-[11px] text-gray-400 -mt-1.5 m-0">Click a member to filter board tasks</p>

          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
            <div
              onClick={() => onSelectAssignee(null)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                selectedAssignee === null
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-100 hover:bg-gray-100"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 text-sm flex items-center justify-center shrink-0">👥</div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-gray-900 truncate">All Team Tasks</span>
                <span className="text-[11px] text-gray-500">Show all {totalTasks} tasks</span>
              </div>
            </div>

            {members.map((m) => {
              const u = m.user || {};
              const email = u.email || "Unknown User";
              const isSelected = selectedAssignee === (u._id || u);
              const role = m.role || "member";
              const userTaskCount = tasks.filter(
                (t) => (t.assignedTo?._id || t.assignedTo) === (u._id || u)
              ).length;

              return (
                <div
                  key={u._id || u}
                  onClick={() => onSelectAssignee(isSelected ? null : u._id || u)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(email)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[13px] font-semibold text-gray-900 truncate" title={email}>
                        {email.split("@")[0]}
                      </span>
                      <span
                        className={`text-[10px] py-px px-1.5 rounded font-semibold ${
                          role === "projectManager"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {role === "projectManager" ? "PM" : "Member"}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {userTaskCount} {userTaskCount === 1 ? "task" : "tasks"} assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
