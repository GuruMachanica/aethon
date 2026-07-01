import { LucideIcon, Inbox } from "lucide-react";

/** Empty-state placeholder: icon + message + optional CTA. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  cta,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-base/40 p-8 text-center sm:p-12">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface/60 text-muted">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h3 className="display text-lg font-semibold text-text">{title}</h3>
      {message && <p className="max-w-xs text-sm text-muted">{message}</p>}
      {cta && (
        <button onClick={cta.onClick} className="btn-ghost mt-2 text-sm">
          {cta.label}
        </button>
      )}
    </div>
  );
}
