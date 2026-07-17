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
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h2 style={styles.logo} onClick={() => navigate("/dashboard")}>
          Project Manager
        </h2>
        <div style={styles.right}>
          {user?.name && <span style={styles.userName}>{user.name}</span>}
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    padding: "16px 0",
    marginBottom: "40px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  container: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "0 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    cursor: "pointer",
    color: "#1a1a1a",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userName: {
    fontSize: "14px",
    color: "#666666",
    fontWeight: "500",
  },
};
