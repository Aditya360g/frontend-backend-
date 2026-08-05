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
} from "react-router-dom";

import AlertMessage from
  "../../components/common/AlertMessage";

import FormField from
  "../../components/common/FormField";

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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../../validation/authSchemas";

export default function ForgotPasswordPage() {
  const [
    submittedEmail,
    setSubmittedEmail,
  ] = useState("");

  const {
    register,
    handleSubmit,
    setError,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(
        forgotPasswordSchema,
      ),

      defaultValues: {
        email: "",
      },
    });

    const handleForgotPassword = async (
    values: ForgotPasswordFormValues,
  ) => {
    try {
      await authService.forgotPassword(
        values.email,
      );

      setSubmittedEmail(
        values.email,
      );
    } catch (error) {
      setError("root", {
        message: getErrorMessage(
          error,
          "Password reset request failed. Please try again.",
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
              Account recovery
            </span>

            <h1>
              Forgot password?
            </h1>

            <p>
              Enter your registered email
              address to request a password
              reset link.
            </p>
          </header>

          <AlertMessage
            type="error"
            message={errors.root?.message}
          />

          {submittedEmail ? (
            <>
              <AlertMessage
                type="success"
                message={
                  "Request accepted for " +
                  submittedEmail +
                  "."
                }
              />

              <div className="auth-information-box">
                <strong>
                  Check your inbox
                </strong>

                 <p>
                  If an account exists for this
                  email, password reset
                  instructions have been
                  generated.
                </p>
              </div>

              <Link
                className="primary-link auth-full-link"
                to={APP_ROUTES.LOGIN}
              >
                Return to login
              </Link>
            </>
          ) : (
            <form
              className="form"
              onSubmit={handleSubmit(
                handleForgotPassword,
              )}
              noValidate
            >
              <FormField
                id="forgot-email"
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={
                  errors.email?.message
                }
                disabled={isSubmitting}
                {...register("email")}
              />

              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : "Send reset link"}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Remember your password?{" "}

            <Link
              to={APP_ROUTES.LOGIN}
            >
              Back to login
            </Link>
          </p>
        </section>
      </ThreeDCard>
    </main>
  );
}