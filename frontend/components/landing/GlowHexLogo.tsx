"use client";
import { useEffect, useRef } from "react";

/**
 * GlowHexLogo — a rounded-square app-icon tile with a glowing teal hexagon
 * outline, soft radial core glow, and a gentle breathing pulse. Self-contained
 * SVG + CSS (no canvas, no deps). Pulse respects prefers-reduced-motion.
 */
export default function GlowHexLogo({
  size = 160,
  color = "#36e9d2",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // pause the pulse when off-screen (perf), resume when visible
    const io = new IntersectionObserver(
      ([e]) => {
        el.style.animationPlayState = e.isIntersecting ? "running" : "paused";
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glow-hex ${className}`}
      style={{ ["--gh-size" as string]: `${size}px`, ["--gh-color" as string]: color }}
      aria-hidden="true"
    >
      <style>{`
        .glow-hex {
          position: relative;
          width: var(--gh-size);
          height: var(--gh-size);
          border-radius: 24%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(120% 120% at 50% 40%, color-mix(in srgb, var(--gh-color) 12%, transparent), transparent 70%),
            linear-gradient(160deg, #16302c 0%, #0c1c1a 100%);
          border: 1px solid color-mix(in srgb, var(--gh-color) 22%, transparent);
          box-shadow:
            0 0 60px color-mix(in srgb, var(--gh-color) 28%, transparent),
            inset 0 0 30px color-mix(in srgb, var(--gh-color) 8%, transparent);
          animation: gh-breathe 3.6s ease-in-out infinite;
        }
        .glow-hex svg { width: 52%; height: 52%; overflow: visible; }
        .glow-hex .gh-stroke {
          fill: none;
          stroke: var(--gh-color);
          stroke-width: 6;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 6px var(--gh-color)) drop-shadow(0 0 16px color-mix(in srgb, var(--gh-color) 70%, transparent));
        }
        @keyframes gh-breathe {
          0%, 100% { box-shadow: 0 0 45px color-mix(in srgb, var(--gh-color) 22%, transparent), inset 0 0 28px color-mix(in srgb, var(--gh-color) 7%, transparent); }
          50%      { box-shadow: 0 0 75px color-mix(in srgb, var(--gh-color) 40%, transparent), inset 0 0 34px color-mix(in srgb, var(--gh-color) 12%, transparent); }
        }
        @media (prefers-reduced-motion: reduce) { .glow-hex { animation: none; } }
      `}</style>

      {/* flat-top hexagon outline, centered */}
      <svg viewBox="0 0 100 100" role="img">
        <polygon className="gh-stroke" points="50,8 88,29 88,71 50,92 12,71 12,29" />
      </svg>
    </div>
  );
}
