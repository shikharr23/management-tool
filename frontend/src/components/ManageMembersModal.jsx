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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4">
      <div className="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="m-0 text-xl font-bold text-gray-900">Manage Project Members</h2>
          <button
            type="button"
            className="bg-transparent border-none text-[28px] cursor-pointer text-gray-400 hover:text-gray-700 leading-none p-1"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {error && <div className="mx-5 mt-4 p-3 bg-red-100 text-red-500 rounded-md text-sm border border-red-200">{error}</div>}

        <div className="p-5 border-b border-gray-100">
          <h3 className="m-0 mb-4 text-base font-semibold text-gray-700">Add Member</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 py-2 px-3 rounded-md border border-gray-300 text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-md max-h-[150px] overflow-y-auto divide-y divide-gray-200">
              {searchResults.map((user) => (
                <div key={user._id} className="flex justify-between items-center p-3 text-sm bg-white">
                  <span className="text-gray-800">{user.email}</span>
                  <div>
                    <button 
                      type="button"
                      onClick={() => handleAddMember(user._id, "member")}
                      className="py-1 px-2.5 bg-emerald-500 text-white border-none rounded text-xs font-semibold hover:bg-emerald-600 cursor-pointer transition-colors"
                    >
                      Add as Member
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAddMember(user._id, "projectManager")}
                      className="py-1 px-2.5 bg-blue-500 text-white border-none rounded text-xs font-semibold hover:bg-blue-600 cursor-pointer transition-colors ml-2"
                    >
                      Add as Manager
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="m-0 mb-4 text-base font-semibold text-gray-700">Current Members</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No members yet.</p>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {members.map((member) => (
                <li key={member.user._id || member.user} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-800">{member.user.email || "Unknown Email"}</span>
                    <span className={member.role === "projectManager" ? "text-[11px] py-0.5 px-2 rounded-full bg-blue-100 text-blue-700 font-semibold w-fit" : "text-[11px] py-0.5 px-2 rounded-full bg-gray-200 text-gray-700 font-semibold w-fit"}>
                      {member.role === "projectManager" ? "Manager" : "Member"}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select 
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                      className="p-1 text-xs rounded border border-gray-300 bg-white text-gray-800"
                    >
                      <option value="member">Member</option>
                      <option value="projectManager">Manager</option>
                    </select>
                    <button 
                      type="button"
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="py-1 px-2.5 bg-red-500 text-white border-none rounded text-xs font-semibold hover:bg-red-600 cursor-pointer transition-colors"
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
