import {
  useState,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AlertMessage from
  "../../components/common/AlertMessage";

import FormField from
  "../../components/common/FormField";

import PasswordField from
  "../../components/common/PasswordField";

import ThreeDCard from
  "../../components/ui/ThreeDCard";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  authService,
} from "../../services/authService";

import {
  getErrorMessage,
} from "../../utils/getErrorMessage";

import {
  loginSchema,
  type LoginFormValues,
} from "../../validation/authSchemas";

interface LoginLocationState {
  from?: string;
  registrationSuccess?: boolean;
}

export default function LoginPage() {
  const {
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const locationState =
    location.state as
      | LoginLocationState
      | null;

  const [
    unverifiedEmail,
    setUnverifiedEmail,
  ] = useState<string | null>(
    null,
  );

  const [
    resendMessage,
    setResendMessage,
  ] = useState("");

  const [
    resendError,
    setResendError,
  ] = useState("");

  const [
    isResending,
    setIsResending,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    setError,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (
    values: LoginFormValues,
  ) => {
    setUnverifiedEmail(null);
    setResendMessage("");
    setResendError("");

    try {
      await login(values);

      navigate(
        locationState?.from
          || APP_ROUTES.DASHBOARD,
        {
          replace: true,
        },
      );
    } catch (error) {
      const errorMessage =
        getErrorMessage(
          error,
          "Login failed. Check your credentials.",
        );

      setError("root", {
        message: errorMessage,
      });

      if (
        errorMessage
          .toLowerCase()
          .includes(
            "verify your email",
          )
      ) {
        setUnverifiedEmail(
          values.email
            .trim()
            .toLowerCase(),
        );
      }
    }
  };

  const handleResendVerification =
    async () => {
      if (!unverifiedEmail) {
        return;
      }

      setIsResending(true);
      setResendMessage("");
      setResendError("");

      try {
        await authService
          .resendEmailVerification(
            unverifiedEmail,
          );

        setResendMessage(
          "A new verification link has been generated. Check the backend terminal.",
        );
      } catch (error) {
        setResendError(
          getErrorMessage(
            error,
            "Unable to resend verification link.",
          ),
        );
      } finally {
        setIsResending(false);
      }
    };

  return (
    <main className="auth-page">
      <ThreeDCard className="auth-3d-scene">
        <section className="auth-card">
          <header className="auth-header">
            <span className="eyebrow">
              Welcome back
            </span>

            <h1>Login</h1>

            <p>
              Sign in to access your
              dashboard.
            </p>
          </header>

          <AlertMessage
            type="success"
            message={
              locationState
                ?.registrationSuccess
                ? "Account created successfully. Sign in to continue."
                : undefined
            }
          />

          <AlertMessage
            type="error"
            message={
              errors.root?.message
            }
          />

          <AlertMessage
            type="success"
            message={resendMessage}
          />

          <AlertMessage
            type="error"
            message={resendError}
          />

          <form
            className="form"
            onSubmit={
              handleSubmit(
                handleLogin,
              )
            }
            noValidate
          >
            <FormField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              error={
                errors.email
                  ?.message
              }
              disabled={
                isSubmitting
                || isResending
              }
              {...register("email")}
            />

            <PasswordField
              id="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={
                errors.password
                  ?.message
              }
              disabled={
                isSubmitting
                || isResending
              }
              {...register(
                "password",
              )}
            />

            <div className="auth-form-actions">
              <Link
                to={
                  APP_ROUTES
                    .FORGOT_PASSWORD
                }
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting
                || isResending
              }
            >
              {isSubmitting
                ? "Signing in..."
                : "Login"}
            </button>

            {unverifiedEmail && (
              <button
                type="button"
                className="secondary-button"
                disabled={isResending}
                onClick={() => {
                  void handleResendVerification();
                }}
              >
                {isResending
                  ? "Generating link..."
                  : "Resend verification link"}
              </button>
            )}
          </form>

          <p className="auth-footer">
            New user?{" "}

            <Link
              to={
                APP_ROUTES.REGISTER
              }
            >
              Create an account
            </Link>
          </p>
        </section>
      </ThreeDCard>
    </main>
  );
}