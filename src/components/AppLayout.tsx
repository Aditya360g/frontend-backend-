import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <div>
          <h1>Backend Learning App</h1>
          <p>React + Spring Boot</p>
        </div>

        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>

          <NavLink to="/profile">Profile</NavLink>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="main-content">
        <p>
          Logged in as: <strong>{user?.email}</strong>
        </p>

        <Outlet />
      </main>
    </div>
  );
}