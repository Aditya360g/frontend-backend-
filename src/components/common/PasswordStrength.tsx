interface PasswordStrengthProps {
  password: string;
}

interface PasswordRule {
  label: string;
  passed: boolean;
}

const STRENGTH_LABELS = [
  "Start typing",
  "Weak",
  "Fair",
  "Good",
  "Strong",
] as const;

export default function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  const rules: PasswordRule[] = [
    {
      label:
        "At least 8 characters",
      passed:
        password.length >= 8,
    },
    {
      label:
        "One uppercase letter",
      passed:
        /[A-Z]/.test(password),
    },
    {
      label:
        "One lowercase letter",
      passed:
        /[a-z]/.test(password),
    },
    {
      label:
        "One number",
      passed:
        /[0-9]/.test(password),
    },
  ];

  const score = rules.filter(
    (rule) => rule.passed,
  ).length;

  return (
    <div
      className={
        `password-strength ` +
        `password-strength--${score}`
      }
      aria-live="polite"
    >
      <div className="password-strength__heading">
        <span>
          Password strength
        </span>

        <strong>
          {STRENGTH_LABELS[score]}
        </strong>
      </div>

      <div
        className="password-strength__meter"
        aria-label={
          `Password strength: ` +
          STRENGTH_LABELS[score]
        }
      >
        {[1, 2, 3, 4].map(
          (segment) => (
            <span
              key={segment}
              className={
                segment <= score
                  ? "is-active"
                  : undefined
              }
            />
          ),
        )}
      </div>

      <ul className="password-rules">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={
              rule.passed
                ? "is-passed"
                : undefined
            }
          >
            <span aria-hidden="true">
              {rule.passed
                ? "✓"
                : "•"}
            </span>

            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}