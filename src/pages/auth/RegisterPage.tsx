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
} from "react-router-dom";

import AlertMessage from
  "../../components/common/AlertMessage";

import FormField from
  "../../components/common/FormField";

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
  useAuth,
} from "../../hooks/useAuth";

import {
  authService,
} from "../../services/authService";

import {
  getErrorMessage,
} from "../../utils/getErrorMessage";

import {
  registerSchema,
  type RegisterFormValues,
} from "../../validation/authSchemas";

export default function RegisterPage() {
  const {
    registerUser,
  } = useAuth();

  const [
    registeredEmail,
    setRegisteredEmail,
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
    control,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver:
      zodResolver(
        registerSchema,
      ),

    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const handleRegister = async (
    values: RegisterFormValues,
  ) => {
    try {
      const normalizedEmail =
        values.email
          .trim()
          .toLowerCase();

      await registerUser({
        name: values.name,
        email: normalizedEmail,
        password:
          values.password,
      });

      setRegisteredEmail(
        normalizedEmail,
      );
    } catch (error) {
      setError("root", {
        message:
          getErrorMessage(
            error,
            "Registration failed.",
          ),
      });
    }
  };

  const handleResendVerification =
    async () => {
      if (!registeredEmail) {
        return;
      }

      setIsResending(true);
      setResendMessage("");
      setResendError("");

      try {
        await authService
          .resendEmailVerification(
            registeredEmail,
          );

        setResendMessage(
          "A new verification link has been generated.",
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

  if (registeredEmail) {
    return (
      <main className="auth-page">
        <ThreeDCard className="auth-3d-scene">
          <section className="auth-card">
            <header className="auth-header">
              <span className="eyebrow">
                Verify email
              </span>

              <h1>
                Registration successful
              </h1>

              <p>
                Verify your email address
                before signing in.
              </p>
            </header>

            <div className="form-success">
              Verification link generated
              for:
              <br />
              <strong>
                {registeredEmail}
              </strong>
            </div>

            <p className="auth-footer">
              During development, copy the
              verification link from the
              backend terminal and open it
              in the browser.
            </p>

            <AlertMessage
              type="success"
              message={resendMessage}
            />

            <AlertMessage
              type="error"
              message={resendError}
            />

            <button
              type="button"
              className="primary-button"
              disabled={isResending}
              onClick={() => {
                void handleResendVerification();
              }}
            >
              {isResending
                ? "Generating link..."
                : "Resend verification link"}
            </button>

            <p className="auth-footer">
              Already verified?{" "}

              <Link
                to={APP_ROUTES.LOGIN}
              >
                Go to login
              </Link>
            </p>
          </section>
        </ThreeDCard>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <ThreeDCard className="auth-3d-scene">
        <section className="auth-card">
          <header className="auth-header">
            <span className="eyebrow">
              Create account
            </span>

            <h1>Register</h1>

            <p>
              Create your SelfB account
              securely.
            </p>
          </header>

          <AlertMessage
            type="error"
            message={
              errors.root?.message
            }
          />

          <form
            className="form"
            onSubmit={
              handleSubmit(
                handleRegister,
              )
            }
            noValidate
          >
            <FormField
              id="name"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              error={
                errors.name?.message
              }
              disabled={
                isSubmitting
              }
              {...register("name")}
            />

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
              }
              {...register("email")}
            />

            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              placeholder="Create a strong password"
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
              id="confirmPassword"
              label="Confirm password"
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
                ? "Creating account..."
                : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already registered?{" "}

            <Link
              to={
                APP_ROUTES.LOGIN
              }
            >
              Login
            </Link>
          </p>
        </section>
      </ThreeDCard>
    </main>
  );
}