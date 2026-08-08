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
    <aside style={{ ...styles.sidebar, width: isOpen ? "320px" : "0px", opacity: isOpen ? 1 : 0 }}>
      <div style={styles.container}>
        {/* Toggle / Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <span style={styles.headerIcon}>📊</span>
            <h3 style={styles.headerTitle}>Project Hub</h3>
          </div>
          <button onClick={onToggle} style={styles.closeBtn} title="Close Sidebar">
            &times;
          </button>
        </div>

        {/* Quick Progress Analytics Card */}
        <div style={styles.card}>
          <div style={styles.progressHeader}>
            <span style={styles.cardLabel}>Progress</span>
            <span style={styles.progressValue}>{progressPercent}%</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{totalTasks}</span>
              <span style={styles.statSub}>Total</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: "#10b981" }}>{completedTasks}</span>
              <span style={styles.statSub}>Done</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: overdueCount > 0 ? "#ef4444" : "#666" }}>
                {overdueCount}
              </span>
              <span style={styles.statSub}>Overdue</span>
            </div>
          </div>
        </div>

        {/* Task Search & Filter Controls */}
        <div style={styles.card}>
          <span style={styles.cardLabel}>Search & Filters</span>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => onSearchChange("")} style={styles.clearSearchBtn}>
                &times;
              </button>
            )}
          </div>

          <div style={styles.priorityFilterWrap}>
            <span style={styles.subLabel}>Priority:</span>
            <div style={styles.pillGroup}>
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => onSelectPriority(p)}
                  style={{
                    ...styles.pillBtn,
                    ...(selectedPriority === p ? styles.activePill : {}),
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div style={styles.card}>
          <div style={styles.teamHeader}>
            <div style={styles.teamTitleWrap}>
              <span style={styles.cardLabel}>Team Members</span>
              <span style={styles.memberBadge}>{members.length}</span>
            </div>
            <button onClick={onOpenManageMembers} style={styles.manageTeamBtn}>
              + Manage
            </button>
          </div>

          <p style={styles.teamHint}>Click a member to filter board tasks</p>

          <div style={styles.membersList}>
            <div
              onClick={() => onSelectAssignee(null)}
              style={{
                ...styles.memberRow,
                ...(selectedAssignee === null ? styles.activeMemberRow : {}),
              }}
            >
              <div style={styles.allAvatar}>👥</div>
              <div style={styles.memberMeta}>
                <span style={styles.memberName}>All Team Tasks</span>
                <span style={styles.memberSub}>Show all {totalTasks} tasks</span>
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
                  style={{
                    ...styles.memberRow,
                    ...(isSelected ? styles.activeMemberRow : {}),
                  }}
                >
                  <div style={styles.avatar}>{getInitials(email)}</div>
                  <div style={styles.memberMeta}>
                    <div style={styles.memberNameRow}>
                      <span style={styles.memberName} title={email}>
                        {email.split("@")[0]}
                      </span>
                      <span
                        style={{
                          ...styles.roleTag,
                          ...(role === "projectManager" ? styles.pmRoleTag : {}),
                        }}
                      >
                        {role === "projectManager" ? "PM" : "Member"}
                      </span>
                    </div>
                    <span style={styles.memberSub}>
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

const styles = {
  sidebar: {
    backgroundColor: "#ffffff",
    borderLeft: "1px solid #e5e7eb",
    height: "calc(100vh - 70px)",
    position: "sticky",
    top: "70px",
    overflowY: "auto",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "-2px 0 10px rgba(0,0,0,0.03)",
    flexShrink: 0,
  },
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    minWidth: "320px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #f3f4f6",
  },
  headerTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerIcon: {
    fontSize: "18px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    color: "#9ca3af",
    lineHeight: 1,
    padding: "4px",
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1px solid #f3f4f6",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  progressBarBg: {
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginTop: "4px",
  },
  statBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
  },
  statNum: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  statSub: {
    fontSize: "11px",
    color: "#6b7280",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "6px 10px",
    gap: "8px",
  },
  searchIcon: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "13px",
    background: "transparent",
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "16px",
    padding: 0,
  },
  priorityFilterWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  subLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6b7280",
  },
  pillGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  pillBtn: {
    padding: "4px 10px",
    fontSize: "12px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    textTransform: "capitalize",
    transition: "all 0.15s ease",
  },
  activePill: {
    backgroundColor: "#111827",
    color: "#ffffff",
    borderColor: "#111827",
    fontWeight: "600",
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  memberBadge: {
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    padding: "1px 7px",
    borderRadius: "999px",
  },
  manageTeamBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  teamHint: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: "-6px 0 0 0",
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxHeight: "260px",
    overflowY: "auto",
  },
  memberRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  activeMemberRow: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    fontWeight: "700",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  allAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memberMeta: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
  },
  memberNameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "4px",
  },
  memberName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  roleTag: {
    fontSize: "10px",
    padding: "1px 5px",
    borderRadius: "4px",
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    fontWeight: "600",
  },
  pmRoleTag: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  memberSub: {
    fontSize: "11px",
    color: "#6b7280",
  },
};
