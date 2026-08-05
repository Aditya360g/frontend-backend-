import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  isAxiosError,
} from "axios";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import ThreeDCard from
  "../../components/ui/ThreeDCard";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  authService,
} from "../../services/authService";

type VerificationStatus =
  | "loading"
  | "success"
  | "inactive"
  | "error";

function getErrorMessage(
  error: unknown,
): string {
  if (
    isAxiosError<{
      message?: string;
    }>(error)
  ) {
    return (
      error.response?.data?.message
      ?? "Unable to verify your email address."
    );
  }

  return "Unable to verify your email address.";
}

export default function VerifyEmailPage() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const verificationStartedRef =
    useRef(false);

  const [
    status,
    setStatus,
  ] = useState<VerificationStatus>(
    token ? "loading" : "error",
  );

  const [
    message,
    setMessage,
  ] = useState(
    token
      ? "Please wait while we securely verify your email address."
      : "The verification token is missing from this link.",
  );

  useEffect(() => {
    if (
      !token
      || verificationStartedRef.current
    ) {
      return;
    }

    verificationStartedRef.current = true;

    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(
          token,
        );

        setStatus("success");

        setMessage(
          "Your email address has been verified successfully. Your account is ready to use.",
        );
      } catch (error) {
        const errorMessage =
          getErrorMessage(error);

        const normalizedMessage =
          errorMessage.toLowerCase();

        if (
          normalizedMessage.includes(
            "already been used",
          )
          || normalizedMessage.includes(
            "already verified",
          )
        ) {
          setStatus("inactive");

          setMessage(
            "This verification link is no longer active. Your email may already be verified, or a newer verification link was generated.",
          );

          return;
        }

        setStatus("error");
        setMessage(errorMessage);
      }
    };

    void verifyEmail();
  }, [token]);

  const heading =
    status === "loading"
      ? "Verifying your email"
      : status === "success"
        ? "Email verified"
        : status === "inactive"
          ? "Link no longer active"
          : "Verification failed";

  return (
    <main className="auth-page">
      <ThreeDCard className="auth-3d-scene">
        <section className="auth-card verification-card">
          <div
            className={`
              verification-status-icon
              verification-status-icon--${status}
            `}
            aria-hidden="true"
          >
            {status === "loading" && (
              <span className="verification-spinner" />
            )}

            {status === "success" && (
              <span>✓</span>
            )}

            {status === "inactive" && (
              <span>!</span>
            )}

            {status === "error" && (
              <span>×</span>
            )}
          </div>

          <header className="auth-header verification-header">
            <span className="eyebrow">
              Email verification
            </span>

            <h1>{heading}</h1>

            <p className="verification-message">
              {message}
            </p>
          </header>

          {status === "loading" && (
            <div
              className="verification-progress"
              role="status"
            >
              Do not close this page.
              Verification may take a few
              seconds.
            </div>
          )}

          {status === "success" && (
            <div className="verification-result verification-result--success">
              Your account has been activated.
              You can now sign in securely.
            </div>
          )}

          {status === "inactive" && (
            <div className="verification-result verification-result--warning">
              Try signing in first. If your
              email is not verified, generate
              a new verification link from
              the login page.
            </div>
          )}

          {status === "error" && (
            <div className="verification-result verification-result--error">
              Check that you opened the
              complete verification link.
            </div>
          )}

          {status !== "loading" && (
            <div className="verification-actions">
              <Link
                className="primary-button verification-login-button"
                to={APP_ROUTES.LOGIN}
              >
                Continue to login
              </Link>

              {status === "error" && (
                <Link
                  className="verification-secondary-link"
                  to={APP_ROUTES.REGISTER}
                >
                  Create a new account
                </Link>
              )}
            </div>
          )}
        </section>
      </ThreeDCard>
    </main>
  );
}