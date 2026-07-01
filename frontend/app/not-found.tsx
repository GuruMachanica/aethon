import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal/30 bg-teal/10 text-tealGlow">
        <Hexagon className="h-8 w-8" strokeWidth={1.5} />
      </span>
      <p className="display text-gradient-gold text-6xl font-semibold">404</p>
      <h1 className="display mt-2 text-2xl font-semibold">This page isn&apos;t in the corpus.</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        The route you followed doesn&apos;t exist. Let&apos;s get you back to something real.
      </p>
      <Link href="/dashboard" className="btn-gold sheen mt-8">
        <span className="relative z-10">Back to console</span>
      </Link>
    </main>
  );
}
