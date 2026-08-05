import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  useAuth,
} from "../../hooks/useAuth";

export default function AppLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [
    location.pathname,
  ]);

  const displayName =
    user?.name?.trim() ||
    "SelfB User";

  const avatarText =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .toUpperCase();

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        await logout();

        navigate(
          APP_ROUTES.LOGIN,
          {
            replace: true,
          },
        );
      } finally {
        setIsLoggingOut(false);
      }
    };

  const navigationClassName = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";

  return (
    <div className="app-shell">
      <aside
        className={
          isMenuOpen
            ? "app-sidebar open"
            : "app-sidebar"
        }
      >
        <div className="sidebar-brand">
          <div className="brand-logo">
            S
          </div>

          <div>
            <h1>
              SelfB
            </h1>

            <p>
              Account platform
            </p>
          </div>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          <NavLink
            to={APP_ROUTES.DASHBOARD}
            className={
              navigationClassName
            }
          >
            <span
              className="sidebar-link-icon"
              aria-hidden="true"
            >
              ◫
            </span>

            <span>
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to={APP_ROUTES.PROFILE}
            className={
              navigationClassName
            }
          >
            <span
              className="sidebar-link-icon"
              aria-hidden="true"
            >
              ○
            </span>

            <span>
              Profile
            </span>
          </NavLink>

          <NavLink
            to={APP_ROUTES.SECURITY}
            className={
              navigationClassName
            }
          >
            <span
              className="sidebar-link-icon"
              aria-hidden="true"
            >
              ◈
            </span>

            <span>
              Security
            </span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {avatarText}
          </div>

          <div className="sidebar-user-details">
            <strong>
              {displayName}
            </strong>

            <span>
              {user?.email ||
                "Email unavailable"}
            </span>
          </div>

          <button
            type="button"
            className="sidebar-logout-button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </aside>

      {isMenuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      )}

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen(
                (currentValue) =>
                  !currentValue,
              );
            }}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar-user">
            <div className="topbar-avatar">
              {avatarText}
            </div>

            <div>
              <strong>
                {displayName}
              </strong>

              <span>
                {user?.email ||
                  "Email unavailable"}
              </span>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}