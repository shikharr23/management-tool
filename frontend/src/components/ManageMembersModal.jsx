import { useState, useEffect } from "react";
import { projectService, authService } from "../services/api";

export default function ManageMembersModal({ projectId, onClose }) {
  const [members, setMembers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMembers(projectId);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    
    try {
      setError("");
      const results = await authService.searchUsers(searchEmail);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async (userId, role) => {
    try {
      await projectService.addMember(projectId, userId, role);
      setSearchEmail("");
      setSearchResults([]);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await projectService.removeMember(projectId, userId);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await projectService.updateMemberRole(projectId, userId, role);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Manage Project Members</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Add Member</h3>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              style={styles.input}
            />
            <button type="submit" className="primary" style={styles.searchBtn}>Search</button>
          </form>

          {searchResults.length > 0 && (
            <div style={styles.searchResults}>
              {searchResults.map((user) => (
                <div key={user._id} style={styles.searchItem}>
                  <span>{user.email}</span>
                  <div>
                    <button 
                      onClick={() => handleAddMember(user._id, "member")}
                      style={styles.addBtn}
                    >
                      Add as Member
                    </button>
                    <button 
                      onClick={() => handleAddMember(user._id, "projectManager")}
                      style={{...styles.addBtn, marginLeft: "8px", backgroundColor: "#3b82f6"}}
                    >
                      Add as Manager
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Current Members</h3>
          {loading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p style={styles.noMembers}>No members yet.</p>
          ) : (
            <ul style={styles.memberList}>
              {members.map((member) => (
                <li key={member.user._id || member.user} style={styles.memberItem}>
                  <div style={styles.memberInfo}>
                    <span style={styles.memberEmail}>{member.user.email || "Unknown Email"}</span>
                    <span style={styles.memberRoleBadge(member.role)}>
                      {member.role === "projectManager" ? "Manager" : "Member"}
                    </span>
                  </div>
                  <div style={styles.memberActions}>
                    <select 
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                      style={styles.roleSelect}
                    >
                      <option value="member">Member</option>
                      <option value="projectManager">Manager</option>
                    </select>
                    <button 
                      onClick={() => handleRemoveMember(member.user._id)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#1a1a1a",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#888",
    lineHeight: 1,
  },
  error: {
    margin: "16px 20px 0",
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    borderRadius: "6px",
    fontSize: "14px",
  },
  section: {
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    color: "#444",
  },
  searchForm: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  searchBtn: {
    padding: "8px 16px",
  },
  searchResults: {
    marginTop: "12px",
    border: "1px solid #eee",
    borderRadius: "6px",
    maxHeight: "150px",
    overflowY: "auto",
  },
  searchItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  addBtn: {
    padding: "4px 8px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  memberList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  memberInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  memberEmail: {
    fontSize: "14px",
    fontWeight: "500",
  },
  memberRoleBadge: (role) => ({
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: "12px",
    backgroundColor: role === "projectManager" ? "#dbeafe" : "#e5e7eb",
    color: role === "projectManager" ? "#1d4ed8" : "#4b5563",
    display: "inline-block",
    width: "fit-content",
  }),
  memberActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  roleSelect: {
    padding: "4px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  removeBtn: {
    padding: "4px 8px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  noMembers: {
    color: "#888",
    fontStyle: "italic",
    fontSize: "14px",
  },
};
