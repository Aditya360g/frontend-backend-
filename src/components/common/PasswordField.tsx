import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

interface PasswordFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="
          M2.4 12
          s3.5-6 9.6-6
          9.6 6 9.6 6
          -3.5 6-9.6 6
          -9.6-6-9.6-6Z
        "
      />

      <circle
        cx="12"
        cy="12"
        r="2.6"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />

      <path
        d="
          M10.6 6.1
          A9.6 9.6 0 0 1 12 6
          c6.1 0 9.6 6 9.6 6
          a16.7 16.7 0 0 1-2.6 3.3
        "
      />

      <path
        d="
          M6.2 6.2
          C3.7 8 2.4 12 2.4 12
          s3.5 6 9.6 6
          a9.8 9.8 0 0 0 3.1-.5
        "
      />

      <path
        d="
          M9.9 9.9
          A3 3 0 0 0 14.1 14
        "
      />
    </svg>
  );
}

const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(function PasswordField(
  {
    label,
    error,
    id,
    disabled,
    onBlur,
    onKeyDown,
    onKeyUp,
    ...inputProps
  },
  ref,
) {
  const [
    isVisible,
    setIsVisible,
  ] = useState(false);

  const [
    capsLockOn,
    setCapsLockOn,
  ] = useState(false);

  const updateCapsLock = (
    event:
      KeyboardEvent<HTMLInputElement>,
  ) => {
    setCapsLockOn(
      event.getModifierState(
        "CapsLock",
      ),
    );
  };

  const errorId = error
    ? `${id}-error`
    : undefined;

  const capsLockId = capsLockOn
    ? `${id}-caps-lock`
    : undefined;

  const describedBy =
    [
      inputProps[
        "aria-describedby"
      ],
      errorId,
      capsLockId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className="
        form-field
        password-field
      "
    >
      <label htmlFor={id}>
        {label}
      </label>

      <div className="password-input-wrapper">
        <input
          {...inputProps}
          ref={ref}
          id={id}
          type={
            isVisible
              ? "text"
              : "password"
          }
          disabled={disabled}
          aria-invalid={
            Boolean(error)
          }
          aria-describedby={
            describedBy
          }
          onKeyDown={(event) => {
            updateCapsLock(event);
            onKeyDown?.(event);
          }}
          onKeyUp={(event) => {
            updateCapsLock(event);
            onKeyUp?.(event);
          }}
          onBlur={(event) => {
            setCapsLockOn(false);
            onBlur?.(event);
          }}
        />

        <button
          type="button"
          className="password-toggle"
          disabled={disabled}
          aria-pressed={isVisible}
          aria-label={
            isVisible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onClick={() => {
            setIsVisible(
              (current) => !current,
            );
          }}
        >
          {isVisible ? (
            <EyeOffIcon />
          ) : (
            <EyeIcon />
          )}
        </button>
      </div>

      {capsLockOn && (
        <small
          id={capsLockId}
          className="caps-lock-warning"
          role="status"
        >
          Caps Lock is on.
        </small>
      )}

      {error && (
        <small
          id={errorId}
          className="field-error"
        >
          {error}
        </small>
      )}
    </div>
  );
});

export default PasswordField;