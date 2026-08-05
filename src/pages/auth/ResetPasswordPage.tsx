import {
  useState,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
  useWatch,
} from "react-hook-form";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import AlertMessage from
  "../../components/common/AlertMessage";

import PasswordField from
  "../../components/common/PasswordField";

import PasswordStrength from
  "../../components/common/PasswordStrength";

import ThreeDCard from
  "../../components/ui/ThreeDCard";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  authService,
} from "../../services/authService";

import {
  getErrorMessage,
} from "../../utils/getErrorMessage";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../validation/authSchemas";

export default function ResetPasswordPage() {
  const [searchParams] =
    useSearchParams();

  const resetToken =
    searchParams.get("token");

  const [
    passwordReset,
    setPasswordReset,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<ResetPasswordFormValues>({
      resolver: zodResolver(
        resetPasswordSchema,
      ),

      defaultValues: {
        password: "",
        confirmPassword: "",
      },
    });

  const password =
    useWatch({
      control,
      name: "password",
      defaultValue: "",
    });

  const handleResetPassword =
  async (
    values:
      ResetPasswordFormValues,
  ) => {
    if (!resetToken) {
      setError("root", {
        message:
          "Reset token is missing or invalid.",
      });

      return;
    }

    try {
      await authService.resetPassword(
        resetToken,
        values.password,
      );

      setPasswordReset(true);
    } catch (error) {
      setError("root", {
        message: getErrorMessage(
          error,
          "Password reset failed. Please request a new reset link.",
        ),
      });
    }
  };

  return (
    <main className="auth-page">
      <ThreeDCard className="auth-3d-scene">
        <section className="auth-card">
          <header className="auth-header">
            <span className="eyebrow">
              Secure recovery
            </span>

            <h1>
              Reset password
            </h1>

            <p>
              Create a new strong
              password for your
              SelfB account.
            </p>
          </header>

          {!resetToken ? (
            <>
              <AlertMessage
                type="error"
                message="Reset token is missing or invalid."
              />

              <div className="auth-information-box">
                <strong>
                  Invalid reset link
                </strong>

                <p>
                  Request a new password
                  reset link from the
                  forgot-password page.
                </p>
              </div>

              <Link
                className="primary-link auth-full-link"
                to={
                  APP_ROUTES
                    .FORGOT_PASSWORD
                }
              >
                Request new link
              </Link>
            </>
          ) : passwordReset ? (
            <>
              <AlertMessage
                type="success"
                message="Your password has been reset successfully."
              />

              <div className="auth-information-box">
                <strong>
                  Password updated
                </strong>

                <p>
                  You can now sign in
                  using your new
                  password.
                </p>
              </div>

              <Link
                className="primary-link auth-full-link"
                to={APP_ROUTES.LOGIN}
              >
                Continue to login
              </Link>
            </>
          ) : (
            <form
              className="form"
              onSubmit={
                handleSubmit(
                  handleResetPassword,
                )
              }
              noValidate
            >
              <AlertMessage
                type="error"
                message={errors.root?.message}
              />

              <PasswordField
                id="reset-password"
                label="New password"
                autoComplete="new-password"
                placeholder="Enter new password"
                error={
                  errors.password
                    ?.message
                }
                disabled={
                  isSubmitting
                }
                {...register(
                  "password",
                )}
              />

              <PasswordStrength
                password={password}
              />

              <PasswordField
                id="reset-confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                placeholder="Enter password again"
                error={
                  errors
                    .confirmPassword
                    ?.message
                }
                disabled={
                  isSubmitting
                }
                {...register(
                  "confirmPassword",
                )}
              />

              <button
                type="submit"
                className="primary-button"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Resetting password..."
                  : "Reset password"}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Back to{" "}

            <Link
              to={APP_ROUTES.LOGIN}
            >
              Login
            </Link>
          </p>
        </section>
      </ThreeDCard>
    </main>
  );
}