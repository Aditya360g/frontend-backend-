import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from
  "./components/layout/AppLayout";

import {
  APP_ROUTES,
} from "./constants/routes";

import LoginPage from
  "./pages/auth/LoginPage";

import RegisterPage from
  "./pages/auth/RegisterPage";

import DashboardPage from
  "./pages/dashboard/DashboardPage";

import ProfilePage from
  "./pages/profile/ProfilePage";

import SecurityPage from
  "./pages/security/SecurityPage";

import NotFoundPage from
  "./pages/system/NotFoundPage";

import ProtectedRoute from
  "./routes/ProtectedRoute";

import PublicOnlyRoute from
  "./routes/PublicOnlyRoute";

import ResetPasswordPage from
  "./pages/auth/ResetPasswordPage";

import ForgotPasswordPage from
  "./pages/auth/ForgotPasswordPage";

import VerifyEmailPage from
  "./pages/auth/VerifyEmailPage";

export default function App() {
 return (
  <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route
        path={APP_ROUTES.LOGIN}
        element={<LoginPage />}
      />

      <Route
        path={APP_ROUTES.REGISTER}
        element={<RegisterPage />}
      />

      <Route
        path={
          APP_ROUTES.FORGOT_PASSWORD
        }
        element={
          <ForgotPasswordPage />
        }
      />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route
          path={
            APP_ROUTES.DASHBOARD
          }
          element={<DashboardPage />}
        />

        <Route
          path={APP_ROUTES.PROFILE}
          element={<ProfilePage />}
        />

        <Route
          path={APP_ROUTES.SECURITY}
          element={<SecurityPage />}
        />
      </Route>
    </Route>
    
    <Route
      path={
       APP_ROUTES.RESET_PASSWORD
      }
      element={
        <ResetPasswordPage />
      }
    />

    <Route
      path="/verify-email"
      element={<VerifyEmailPage />}
    />

    <Route
      path={APP_ROUTES.ROOT}
      element={
        <Navigate
          to={APP_ROUTES.DASHBOARD}
          replace
        />
      }
    />

    <Route
      path="*"
      element={<NotFoundPage />}
    />
  </Routes>
);
}