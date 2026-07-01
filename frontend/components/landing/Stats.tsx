"use client";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Clock, Layers, AlertTriangle, Zap, ArrowRight } from "lucide-react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {Number.isInteger(to) ? Math.round(val) : val.toFixed(1)}
      {suffix}
    </span>
  );
}

type Stat = {
  value: number;
  suffix: string;
  label: string;
  source: string;
  icon: typeof Clock;
  solution?: boolean;
};

const stats: Stat[] = [
  {
    value: 35,
    suffix: "%",
    label: "Of an engineer's day lost to searching — eliminated",
    source: "McKinsey, 2024",
    icon: Clock,
  },
  {
    value: 12,
    suffix: "",
    label: "Disconnected document systems, unified into one",
    source: "NASSCOM–EY",
    icon: Layers,
  },
  {
    value: 22,
    suffix: "%",
    label: "Of unplanned downtime traced to knowledge gaps",
    source: "BIS Research",
    icon: AlertTriangle,
  },
  {
    value: 2.4,
    suffix: "s",
    label: "Average cited answer time vs. hours of manual search",
    source: "AETHON benchmark",
    icon: Zap,
    solution: true,
  },
];

export function Stats() {
  return (
    <section id="problem" className="relative px-6 py-16 sm:py-24">
      {/* heading + intro */}
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <span className="chip mb-5">The cost of fragmented knowledge</span>
        <h2 className="display text-3xl font-semibold sm:text-4xl">
          The data exists. <span className="text-gradient-gold italic">Acting on it</span>{" "}
          doesn&apos;t.
        </h2>
        <p className="mt-4 text-muted">
          In asset-heavy industry, critical knowledge is scattered across a dozen systems —
          and the cost is measured in lost hours, downtime, and risk.
        </p>
      </Reveal>

      <Reveal>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border/40 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: "rgba(14,48,45,0.9)" }}
              className={`relative bg-surface/70 p-6 text-center transition-colors sm:p-8 ${
                s.solution ? "bg-teal/[0.06]" : ""
              }`}
            >
              {/* THE PROBLEM / THE FIX tag */}
              <span
                className={`absolute left-1/2 top-3 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.22em] ${
                  s.solution ? "text-tealGlow" : "text-muted/50"
                }`}
              >
                {s.solution ? "The fix" : "The problem"}
              </span>

              {/* icon — borderless, larger, continuous 3D coin-flip spin */}
              <motion.span
                className={`mx-auto mb-3 mt-5 flex items-center justify-center ${
                  s.solution ? "text-tealGlow" : "text-muted"
                }`}
                style={{ transformStyle: "preserve-3d", perspective: 400 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <s.icon className="h-8 w-8" strokeWidth={1.5} />
              </motion.span>

              <p
                className={`display text-4xl font-semibold md:text-5xl ${
                  s.solution ? "text-gradient-gold" : "text-gradient-teal"
                }`}
              >
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">{s.label}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted/50">
                {s.source}
              </p>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* transition line into Features */}
      <Reveal delay={0.2}>
        <div className="mt-8 flex items-center justify-center">
          <a
            href="#features"
            className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-tealGlow"
          >
            AETHON closes this gap
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
