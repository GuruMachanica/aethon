import { Hexagon } from "lucide-react";

/** Branded full-route Suspense fallback. */
export function RouteLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center md:ml-60">
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-spinSlow rounded-2xl border-2 border-teal/20 border-t-tealGlow" />
          <Hexagon className="h-6 w-6 animate-pulseGlow text-tealGlow" strokeWidth={1.5} />
        </span>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}…</p>
      </div>
    </div>
  );
}
