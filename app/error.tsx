"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Hexagon, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.span
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger"
      >
        <Hexagon className="h-8 w-8" strokeWidth={1.5} />
      </motion.span>
      <h1 className="display text-3xl font-semibold">Something broke in the brain.</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        An unexpected error occurred while rendering this view. You can retry, or head back
        to the console.
      </p>
      <div className="mt-8 flex gap-4">
        <button onClick={reset} className="btn-gold sheen flex items-center gap-2">
          <RotateCw className="relative z-10 h-4 w-4" />
          <span className="relative z-10">Try again</span>
        </button>
        <a href="/dashboard" className="btn-ghost">
          Back to console
        </a>
      </div>
    </main>
  );
}
