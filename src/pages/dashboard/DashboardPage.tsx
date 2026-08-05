import {
  Link,
} from "react-router-dom";

import {
  APP_ROUTES,
} from "../../constants/routes";

import {
  useAuth,
} from "../../hooks/useAuth";

function formatAccountDate(
  value?: string,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(date);
}

export default function DashboardPage() {
  const {
    user,
  } = useAuth();

  const displayName =
    user?.name?.trim() || "User";

  const firstName =
    displayName.split(/\s+/)[0];

  const displayedRole =
    user?.role ||
    user?.roles?.[0] ||
    "USER";

  const profileFields = [
    user?.name,
    user?.email,
    user?.phone,
    user?.bio,
  ];

  const completedFields =
    profileFields.filter(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0,
    ).length;

  const profileCompletion =
    Math.round(
      (
        completedFields /
        profileFields.length
      ) * 100,
    );

  const currentHour =
    new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <section>
      <header className="page-header">
        <span className="eyebrow">
          Account dashboard
        </span>

        <h2>
          {greeting}, {firstName}
        </h2>

        <p>
          Manage your SelfB account and
          review your profile information.
        </p>
      </header>

      <div className="dashboard-grid">
        <article className="stat-card">
          <span>Account status</span>

          <strong>
            Active
          </strong>
        </article>

        <article className="stat-card">
          <span>Account role</span>

          <strong>
            {displayedRole}
          </strong>
        </article>

        <article className="stat-card">
          <span>Profile completion</span>

          <strong>
            {profileCompletion}%
          </strong>
        </article>
      </div>

      <article
        className="content-card"
        style={{
          marginBottom: "24px",
        }}
      >
        <h3>
          Account overview
        </h3>

        <ol className="flow-list">
          <li>
            <strong>Name:</strong>{" "}
            {displayName}
          </li>

          <li>
            <strong>Email:</strong>{" "}
            {user?.email || "Not available"}
          </li>

          <li>
            <strong>Phone:</strong>{" "}
            {user?.phone || "Not added"}
          </li>

          <li>
            <strong>User ID:</strong>{" "}
            {user?.id || "Not available"}
          </li>

          <li>
            <strong>Member since:</strong>{" "}
            {formatAccountDate(
              user?.createdAt,
            )}
          </li>
        </ol>
      </article>

      <article className="content-card">
        <h3>
          Complete your profile
        </h3>

        <p>
          Add your phone number and bio to
          keep your SelfB profile complete
          and up to date.
        </p>

        <Link
          to={APP_ROUTES.PROFILE}
          className="nav-link"
        >
          Open profile settings
        </Link>
      </article>
    </section>
  );
}