import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 mb-10 shadow-xs">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex justify-between items-center">
        <h2
          className="text-[22px] font-bold cursor-pointer text-gray-900 tracking-tight"
          onClick={() => navigate("/dashboard")}
        >
          Project Manager
        </h2>
        <div className="flex items-center gap-4">
          {user?.name && (
            <span className="text-sm text-gray-600 font-medium">{user.name}</span>
          )}
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 transition-all cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
