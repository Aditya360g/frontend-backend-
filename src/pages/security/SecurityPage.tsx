import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  useNavigate,
} from "react-router-dom";

import AlertMessage from
  "../../components/common/AlertMessage";

import PasswordField from
  "../../components/common/PasswordField";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  userService,
} from "../../services/userService";

import type {
  Session,
} from "../../types/auth";

import {
  getErrorMessage,
} from "../../utils/getErrorMessage";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../../validation/authSchemas";

function formatSessionDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getDeviceName(
  userAgent: string | null,
): string {
  if (!userAgent) {
    return "Unknown device";
  }

  let browser = "Browser";
  let operatingSystem = "Unknown OS";

  if (/Edg/i.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/Chrome/i.test(userAgent)) {
    browser = "Google Chrome";
  } else if (/Firefox/i.test(userAgent)) {
    browser = "Mozilla Firefox";
  } else if (/Safari/i.test(userAgent)) {
    browser = "Safari";
  }

  if (/Windows/i.test(userAgent)) {
    operatingSystem = "Windows";
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = "Android";
  } else if (/iPhone|iPad/i.test(userAgent)) {
    operatingSystem = "iOS";
  } else if (/Mac OS/i.test(userAgent)) {
    operatingSystem = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = "Linux";
  }

  return `${browser} on ${operatingSystem}`;
}

export default function SecurityPage() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    sessions,
    setSessions,
  ] = useState<Session[]>([]);

  const [
    isLoadingSessions,
    setIsLoadingSessions,
  ] = useState(true);

  const [
    sessionError,
    setSessionError,
  ] = useState("");

  const [
    revokingSessionId,
    setRevokingSessionId,
  ] = useState<number | null>(null);

  const [
    isRevokingOthers,
    setIsRevokingOthers,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      changePasswordSchema,
    ),

    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const loadActiveSessions =
    useCallback(async () => {
      setSessionError("");

      try {
        const activeSessions =
          await userService
            .getActiveSessions();

        setSessions(activeSessions);
      } catch (error) {
        setSessionError(
          getErrorMessage(
            error,
            "Active sessions could not be loaded.",
          ),
        );
      } finally {
        setIsLoadingSessions(false);
      }
    }, []);

  useEffect(() => {
    void loadActiveSessions();
  }, [
    loadActiveSessions,
  ]);

  const handleChangePassword =
    async (
      values: ChangePasswordFormValues,
    ) => {
      try {
        await userService.changePassword({
          currentPassword:
            values.currentPassword,

          newPassword:
            values.newPassword,
        });

        reset();

        await logout().catch(
          () => undefined,
        );

        navigate(
          APP_ROUTES.LOGIN,
          {
            replace: true,
          },
        );
      } catch (error) {
        setError("root", {
          message: getErrorMessage(
            error,
            "Password change failed. Please try again.",
          ),
        });
      }
    };

  const handleRevokeSession =
    async (
      session: Session,
    ) => {
      setSessionError("");
      setRevokingSessionId(
        session.sessionId,
      );

      try {
        await userService.revokeSession(
          session.sessionId,
        );

        if (session.currentSession) {
          await logout().catch(
            () => undefined,
          );

          navigate(
            APP_ROUTES.LOGIN,
            {
              replace: true,
            },
          );

          return;
        }

        await loadActiveSessions();
      } catch (error) {
        setSessionError(
          getErrorMessage(
            error,
            "Session could not be logged out.",
          ),
        );
      } finally {
        setRevokingSessionId(null);
      }
    };

  const handleRevokeOtherSessions =
    async () => {
      setSessionError("");
      setIsRevokingOthers(true);

      try {
        await userService
          .revokeOtherSessions();

        await loadActiveSessions();
      } catch (error) {
        setSessionError(
          getErrorMessage(
            error,
            "Other sessions could not be logged out.",
          ),
        );
      } finally {
        setIsRevokingOthers(false);
      }
    };

  const otherSessionsCount =
    sessions.filter(
      (session) =>
        !session.currentSession,
    ).length;

  return (
    <section className="security-page">
      <header className="page-header">
        <span className="eyebrow">
          Account protection
        </span>

        <h2>
          Security
        </h2>

        <p>
          Update your password and manage
          devices signed in to your account.
        </p>
      </header>

      <div className="dashboard-grid">
        <article className="stat-card">
          <span>
            Password status
          </span>

          <strong>
            Protected
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Active sessions
          </span>

          <strong>
            {sessions.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Signed-in account
          </span>

          <strong>
            {user?.email ||
              "Not available"}
          </strong>
        </article>
      </div>

      <article className="content-card security-form-card">
        <div className="profile-form-header">
          <h3>
            Change password
          </h3>

          <p>
            Changing your password will log
            out all active sessions.
          </p>
        </div>

        <AlertMessage
          type="error"
          message={
            errors.root?.message
          }
        />

        <form
          className="form profile-form"
          onSubmit={
            handleSubmit(
              handleChangePassword,
            )
          }
          noValidate
        >
          <PasswordField
            id="currentPassword"
            label="Current password"
            autoComplete="current-password"
            placeholder="Enter current password"
            error={
              errors.currentPassword
                ?.message
            }
            {...register(
              "currentPassword",
            )}
          />

          <PasswordField
            id="newPassword"
            label="New password"
            autoComplete="new-password"
            placeholder="Enter new password"
            error={
              errors.newPassword
                ?.message
            }
            {...register(
              "newPassword",
            )}
          />

          <PasswordField
            id="confirmNewPassword"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            error={
              errors.confirmNewPassword
                ?.message
            }
            {...register(
              "confirmNewPassword",
            )}
          />

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Changing password..."
              : "Change password"}
          </button>
        </form>
      </article>

      <article className="content-card sessions-card">
        <div className="sessions-header">
          <div>
            <h3>
              Active sessions
            </h3>

            <p>
              Review devices currently
              signed in to your account.
            </p>
          </div>

          <button
            type="button"
            className="session-danger-button"
            disabled={
              isRevokingOthers ||
              otherSessionsCount === 0
            }
            onClick={() => {
              void handleRevokeOtherSessions();
            }}
          >
            {isRevokingOthers
              ? "Logging out..."
              : "Log out other devices"}
          </button>
        </div>

        <AlertMessage
          type="error"
          message={sessionError}
        />

        {isLoadingSessions ? (
          <p>
            Loading active sessions...
          </p>
        ) : sessions.length === 0 ? (
          <p>
            No active sessions found.
          </p>
        ) : (
          <div className="sessions-list">
            {sessions.map(
              (session) => (
                <div
                  key={session.sessionId}
                  className={
                    session.currentSession
                      ? "session-item current"
                      : "session-item"
                  }
                >
                  <div className="session-icon">
                    ◫
                  </div>

                  <div className="session-information">
                    <div className="session-title">
                      <strong>
                        {getDeviceName(
                          session.userAgent,
                        )}
                      </strong>

                      {session.currentSession && (
                        <span>
                          Current device
                        </span>
                      )}
                    </div>

                    <p>
                      IP address:{" "}
                      {session.ipAddress ||
                        "Not available"}
                    </p>

                    <small>
                      Signed in:{" "}
                      {formatSessionDate(
                        session.signedInAt,
                      )}
                    </small>

                    <small>
                      Last activity:{" "}
                      {formatSessionDate(
                        session.lastActivityAt,
                      )}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="session-danger-button"
                    disabled={
                      revokingSessionId ===
                      session.sessionId
                    }
                    onClick={() => {
                      void handleRevokeSession(
                        session,
                      );
                    }}
                  >
                    {revokingSessionId ===
                    session.sessionId
                      ? "Logging out..."
                      : "Log out"}
                  </button>
                </div>
              ),
            )}
          </div>
        )}
      </article>
    </section>
  );
}