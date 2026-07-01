"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARDS = ["Card", "Card", "Card", "Card", "Card", "Card", "Card"];
const SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };
const AUTOPLAY_MS = 1600;

/**
 * Interactive 3D card carousel — a rotating cylinder of cards with 3D
 * perspective. The active center card flips 180° on hover to reveal its back.
 * Drag / click / arrow-key navigation. Spring physics throughout.
 */
export default function CardCarousel3D() {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);

  // always-current pause flag so a leaked interval tick can't advance while hovered
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const n = CARDS.length;
  const go = (dir: number) => {
    setFlipped(false);
    setActive((a) => (a + dir + n) % n);
  };

  // auto-rotate — one persistent timer that checks the live pause flag each tick
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setFlipped(false);
      setActive((a) => (a + 1) % n);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [n]);

  // shortest signed offset of card i from the active index (wraps the cylinder)
  const offsetOf = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  // map an offset to its 3D transform on the cylinder.
  // Tighter x-spacing so adjacent cards peek behind the center = a real wheel.
  const transformFor = (offset: number) => {
    const abs = Math.abs(offset);
    const dir = Math.sign(offset);
    if (offset === 0) {
      return { rotateY: 0, z: 0, scale: 1, x: 0, opacity: 1, zIndex: 50, show: true };
    }
    if (abs === 1) {
      return { rotateY: -dir * 42, z: -200, scale: 0.86, x: dir * 230, opacity: 1, zIndex: 40, show: true };
    }
    if (abs === 2) {
      return { rotateY: -dir * 62, z: -420, scale: 0.72, x: dir * 380, opacity: 0.55, zIndex: 30, show: true };
    }
    // far cards: hidden + non-interactive (don't render the spread-out ghosts)
    return { rotateY: -dir * 80, z: -600, scale: 0.55, x: dir * 460, opacity: 0, zIndex: 10, show: false };
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-white py-10">
      <div
        className="relative flex h-[40rem] w-full items-center justify-center [perspective:1600px]"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        {CARDS.map((label, i) => {
          const offset = offsetOf(i);
          const t = transformFor(offset);
          const isActive = offset === 0;
          return (
            <motion.div
              key={i}
              className="absolute h-[34rem] w-[23rem] [transform-style:preserve-3d]"
              style={{
                zIndex: t.zIndex,
                pointerEvents: t.show ? "auto" : "none",
              }}
              animate={{
                rotateY: t.rotateY,
                z: t.z,
                scale: t.scale,
                x: t.x,
                opacity: t.opacity,
              }}
              transition={SPRING}
              onMouseEnter={() => {
                // hover handler lives on the OUTER (non-flipping) wrapper so the
                // cursor never loses the target when the inner card flips 180°
                if (isActive) {
                  setPaused(true);
                  setFlipped(true);
                }
              }}
              onMouseLeave={() => {
                if (isActive) {
                  setPaused(false);
                  setFlipped(false);
                }
              }}
              onClick={() => {
                if (!isActive) {
                  setFlipped(false);
                  setActive(i);
                }
              }}
            >
              {/* the flipping inner card (pointer-events disabled so it can't
                  steal hover events from the stable outer wrapper) */}
              <motion.div
                className="pointer-events-none relative h-full w-full [transform-style:preserve-3d]"
                animate={{ rotateY: isActive && flipped ? 180 : 0 }}
                transition={SPRING}
              >
                {/* FRONT */}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-black/15 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] [backface-visibility:hidden]">
                  <span className="text-5xl font-bold text-black">{label}</span>
                </div>
                {/* BACK */}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-900 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-5xl font-bold text-white">Back</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-black shadow transition hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFlipped(false);
                setActive(i);
              }}
              aria-label={`Go to card ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-black" : "w-2 bg-black/25"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-black shadow transition hover:bg-neutral-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
