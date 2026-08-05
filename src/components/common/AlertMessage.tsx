interface AlertMessageProps {
  type: "error" | "success";
  message?: string;
}

export default function AlertMessage({
  type,
  message,
}: AlertMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`alert alert-${type}`}
      role={
        type === "error"
          ? "alert"
          : "status"
      }
    >
      {message}
    </div>
  );
}