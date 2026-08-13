export default function ProjectSidebar({
  project,
  members = [],
  tasks = [],
  stats = null,
  statsLoading = false,
  statsError = null,
  onRetryStats,
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
  // Use server-side stats if available, with safe fallbacks
  const totalTasks = stats ? stats.totalTasks : tasks.length;
  const completedTasks = stats
    ? stats.completedTasks
    : tasks.filter((t) => t.status === "completed").length;
  const completionRate = stats
    ? stats.completionRate
    : totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const byStatus = stats
    ? stats.byStatus
    : {
        todo: tasks.filter((t) => t.status === "todo").length,
        "in-progress": tasks.filter((t) => t.status === "in-progress").length,
        review: tasks.filter((t) => t.status === "review").length,
        completed: completedTasks,
      };

  const byPriority = stats
    ? stats.byPriority
    : {
        low: tasks.filter((t) => t.priority === "low").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        high: tasks.filter((t) => t.priority === "high").length,
      };

  const overdueCount = stats
    ? stats.overdueCount
    : tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false;
        return new Date(t.dueDate) < new Date();
      }).length;

  const dueSoonCount = stats ? stats.dueSoonCount : 0;

  const priorities = ["all", "high", "medium", "low"];

  const getInitials = (email = "") => {
    return email.substring(0, 2).toUpperCase() || "U";
  };

  // Compute percentage widths for the 4-segment status bar
  const todoPercent = totalTasks > 0 ? (byStatus.todo / totalTasks) * 100 : 0;
  const inProgressPercent =
    totalTasks > 0 ? (byStatus["in-progress"] / totalTasks) * 100 : 0;
  const reviewPercent =
    totalTasks > 0 ? (byStatus.review / totalTasks) * 100 : 0;
  const completedPercent =
    totalTasks > 0 ? (byStatus.completed / totalTasks) * 100 : 0;

  // Workload lookup map: userId -> count
  const workloadMap = new Map();
  let unassignedCount = 0;
  if (stats && Array.isArray(stats.memberWorkload)) {
    stats.memberWorkload.forEach((w) => {
      if (w.userId) {
        workloadMap.set(String(w.userId), w.count);
      } else {
        unassignedCount = w.count;
      }
    });
  } else {
    tasks.forEach((t) => {
      const uid = t.assignedTo?._id || t.assignedTo;
      if (uid) {
        workloadMap.set(String(uid), (workloadMap.get(String(uid)) || 0) + 1);
      } else {
        unassignedCount += 1;
      }
    });
  }

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

        {/* Analytics Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Project Health
            </span>
            <span className="text-base font-bold text-gray-900">
              {completionRate}%
            </span>
          </div>

          {statsLoading && !stats ? (
            /* Shimmer Skeleton on Initial Load */
            <div className="flex flex-col gap-2.5 animate-pulse py-1">
              <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented 4-Color Status Bar */}
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex w-full">
                {todoPercent > 0 && (
                  <div
                    style={{ width: `${todoPercent}%` }}
                    className="bg-[#888888] h-full transition-all duration-300"
                    title={`Todo: ${byStatus.todo}`}
                  />
                )}
                {inProgressPercent > 0 && (
                  <div
                    style={{ width: `${inProgressPercent}%` }}
                    className="bg-[#1a1a1a] h-full transition-all duration-300"
                    title={`In Progress: ${byStatus["in-progress"]}`}
                  />
                )}
                {reviewPercent > 0 && (
                  <div
                    style={{ width: `${reviewPercent}%` }}
                    className="bg-[#6366f1] h-full transition-all duration-300"
                    title={`Review: ${byStatus.review}`}
                  />
                )}
                {completedPercent > 0 && (
                  <div
                    style={{ width: `${completedPercent}%` }}
                    className="bg-emerald-500 h-full transition-all duration-300"
                    title={`Completed: ${byStatus.completed}`}
                  />
                )}
              </div>

              {/* Status Breakdown Pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center mt-1">
                <div className="bg-white border border-gray-200 rounded-md p-1.5 flex flex-col">
                  <span className="text-xs font-bold text-gray-700">
                    {byStatus.todo}
                  </span>
                  <span className="text-[10px] text-gray-500">Todo</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-1.5 flex flex-col">
                  <span className="text-xs font-bold text-gray-900">
                    {byStatus["in-progress"]}
                  </span>
                  <span className="text-[10px] text-gray-500">In Prog</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-1.5 flex flex-col">
                  <span className="text-xs font-bold text-indigo-600">
                    {byStatus.review}
                  </span>
                  <span className="text-[10px] text-gray-500">Review</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-1.5 flex flex-col">
                  <span className="text-xs font-bold text-emerald-600">
                    {byStatus.completed}
                  </span>
                  <span className="text-[10px] text-gray-500">Done</span>
                </div>
              </div>

              {/* Deadline & Risk Alerts */}
              {(overdueCount > 0 || dueSoonCount > 0) && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  {overdueCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-[11px] font-semibold py-1 px-2.5 rounded-full flex items-center gap-1 border border-red-200">
                      ⚠️ {overdueCount} Overdue
                    </span>
                  )}
                  {dueSoonCount > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold py-1 px-2.5 rounded-full flex items-center gap-1 border border-amber-200">
                      ⏰ {dueSoonCount} Due Soon
                    </span>
                  )}
                </div>
              )}

              {/* Priority Distribution Chips */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                <span className="font-medium">Priorities:</span>
                <div className="flex gap-2">
                  <span className="text-red-600 font-semibold">
                    {byPriority.high} High
                  </span>
                  <span className="text-amber-600 font-semibold">
                    {byPriority.medium} Med
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {byPriority.low} Low
                  </span>
                </div>
              </div>

              {totalTasks === 0 && (
                <p className="text-xs text-gray-400 italic text-center m-0 py-1">
                  No tasks yet — create a task to start tracking metrics.
                </p>
              )}
            </>
          )}

          {/* Non-Blocking Error State */}
          {statsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex justify-between items-center text-xs text-red-700">
              <span>Failed to refresh analytics</span>
              {onRetryStats && (
                <button
                  type="button"
                  onClick={onRetryStats}
                  className="text-xs font-bold underline bg-transparent border-none text-red-800 cursor-pointer p-0 hover:text-red-950"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Search & Filter Controls */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Search & Filters
          </span>
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

        {/* Team Members & Task Distribution Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Task Distribution
              </span>
              <span className="text-[11px] font-bold bg-gray-200 text-gray-700 py-px px-2 rounded-full">
                {members.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenManageMembers}
              className="bg-transparent border-none text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer p-0"
            >
              + Manage
            </button>
          </div>

          <p className="text-[11px] text-gray-400 -mt-1.5 m-0">
            Click a member to filter board tasks
          </p>

          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
            <div
              onClick={() => onSelectAssignee(null)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                selectedAssignee === null
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-100 hover:bg-gray-100"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 text-sm flex items-center justify-center shrink-0">
                👥
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-gray-900 truncate">
                  All Team Tasks
                </span>
                <span className="text-[11px] text-gray-500">
                  Show all {totalTasks} tasks
                </span>
              </div>
            </div>

            {members.map((m) => {
              const u = m.user || {};
              const userIdStr = String(u._id || u);
              const email = u.email || (u.profile && u.profile.username) || "Unknown User";
              const isSelected = selectedAssignee === userIdStr;
              const role = m.role || "member";
              const userTaskCount = workloadMap.get(userIdStr) || 0;

              return (
                <div
                  key={userIdStr}
                  onClick={() => onSelectAssignee(isSelected ? null : userIdStr)}
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
                      <span
                        className="text-[13px] font-semibold text-gray-900 truncate"
                        title={email}
                      >
                        {u.profile?.username || email.split("@")[0]}
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

            {unassignedCount > 0 && (
              <div className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0">
                  ?
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-700">
                    Unassigned
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {unassignedCount} {unassignedCount === 1 ? "task" : "tasks"} without assignee
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
