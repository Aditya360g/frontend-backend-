interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({
  message = "Loading...",
}: PageLoaderProps) {
  return (
    <main className="page-loader">
      <div
        className="spinner"
        aria-hidden="true"
      />

      <p>{message}</p>
    </main>
  );
}