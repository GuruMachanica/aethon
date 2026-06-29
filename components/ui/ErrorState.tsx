import { AlertTriangle, RotateCw } from "lucide-react";

/** Inline error card with a retry button. */
export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center sm:p-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-ghost mt-1 flex items-center gap-2 text-sm"
        >
          <RotateCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}
