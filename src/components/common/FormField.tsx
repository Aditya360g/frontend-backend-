import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

interface FormFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = forwardRef<
  HTMLInputElement,
  FormFieldProps
>(function FormField(
  {
    label,
    error,
    id,
    "aria-describedby":
      ariaDescribedBy,
    ...inputProps
  },
  ref,
) {
  const errorId = error
    ? `${id}-error`
    : undefined;

  const describedBy =
    [
      ariaDescribedBy,
      errorId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
      </label>

      <input
        {...inputProps}
        ref={ref}
        id={id}
        aria-invalid={
          Boolean(error)
        }
        aria-describedby={
          describedBy
        }
      />

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

export default FormField;