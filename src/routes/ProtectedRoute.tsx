import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import PageLoader from
  "../components/common/PageLoader";

import {
  APP_ROUTES,
} from "../constants/routes";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <PageLoader message="Checking authentication..." />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={APP_ROUTES.LOGIN}
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  return <Outlet />;
}