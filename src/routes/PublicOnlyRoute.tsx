import {
  Navigate,
  Outlet,
} from "react-router-dom";

import PageLoader from
  "../components/common/PageLoader";

import {
  APP_ROUTES,
} from "../constants/routes";

import { useAuth } from "../hooks/useAuth";

export default function PublicOnlyRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <PageLoader message="Loading application..." />
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={APP_ROUTES.DASHBOARD}
        replace
      />
    );
  }

  return <Outlet />;
}