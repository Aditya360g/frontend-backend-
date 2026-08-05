import {
  Link,
} from "react-router-dom";

import {
  APP_ROUTES,
} from "../../constants/routes";

export default function NotFoundPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">
          404
        </span>

        <h1>Page not found</h1>

        <p>
          The requested page does not exist.
        </p>

        <Link
          className="primary-link"
          to={APP_ROUTES.DASHBOARD}
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}