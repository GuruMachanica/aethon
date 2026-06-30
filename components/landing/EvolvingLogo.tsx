"use client";
import { useEffect, useRef } from "react";

/**
 * EvolvingLogo — the CTA logo assembles itself from scattered glowing
 * fragments. Particles swirl in from the edges, lock into the sampled
 * logo shape, then crossfade into the real (slowly spinning) logo image.
 * Replays each time it scrolls into view. Canvas 2D, no dependencies.
 * Recoloured to AETHON teal/gold.
 */

// AETHON palette: tealGlow, teal, warm-white, gold
const COLORS = ["54,233,210", "31,184,166", "234,250,246", "244,212,136"];
const N = 1600;
const DUR_ASSEMBLE = 2600;
const DUR_HOLD = 500;
const DUR_FADE = 1100;
const TOTAL = DUR_ASSEMBLE + DUR_HOLD + DUR_FADE;
const LOGO_SRC = "/hex.svg";

/**
 * Build the particle target by rasterizing a clean HEXAGON (thick outline +
 * centre dot) — no square tile, guaranteed shape. Samples its opaque pixels.
 */
async function sampleLogoPoints(count: number): Promise<Float32Array | null> {
  const SIZE = 300;
  const oc = document.createElement("canvas");
  oc.width = oc.height = SIZE;
  const g = oc.getContext("2d", { willReadFrequently: true })!;

  // Sample the ACTUAL hex.svg so particles + final logo are pixel-identical
  // (same shape, size and orientation — no manual approximation).
  let drawn = false;
  try {
    const img = new Image();
    img.src = LOGO_SRC;
    await img.decode();
    g.drawImage(img, 0, 0, SIZE, SIZE);
    drawn = true;
  } catch {
    /* fall back to a drawn hexagon below */
  }

  if (!drawn) {
    const cx = SIZE / 2,
      cy = SIZE / 2,
      R = SIZE * 0.435;
    g.strokeStyle = "#fff";
    g.lineWidth = SIZE * 0.05;
    g.lineJoin = "round";
    g.beginPath();
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      k === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(cx, cy, SIZE * 0.06, 0, Math.PI * 2);
    g.fill();
  }

  const data = g.getImageData(0, 0, SIZE, SIZE).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x += 2) {
      if (data[(y * SIZE + x) * 4 + 3] > 100)
        pts.push({ x: x / SIZE - 0.5, y: y / SIZE - 0.5 });
    }
  }

  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const p = pts.length ? pts[(i * 7919) % pts.length] : { x: 0, y: 0 };
    out[i * 2] = p.x;
    out[i * 2 + 1] = p.y;
  }
  return out;
}

function makeSprites(): HTMLCanvasElement[] {
  return COLORS.map((color) => {
    const s = document.createElement("canvas");
    s.width = s.height = 24;
    const g = s.getContext("2d")!;
    const grad = g.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.3, `rgba(${color},0.8)`);
    grad.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 24, 24);
    return s;
  });
}

export default function EvolvingLogo({
  finalOpacity = 0.9,
  className = "",
}: {
  finalOpacity?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!wrap || !canvas || !img) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      img.style.opacity = String(finalOpacity);
      img.style.animation = "ev-spin 20s linear infinite";
      return;
    }

    const ctx = canvas.getContext("2d")!;
    const sprites = makeSprites();
    let pts: Float32Array | null = null;
    let pendingStart = false;
    let raf = 0;
    let running = false;
    let startT = 0;
    let W = 0,
      H = 0;

    const px = new Float32Array(N),
      py = new Float32Array(N);
    const vx = new Float32Array(N),
      vy = new Float32Array(N);
    const sz = new Float32Array(N);
    const ci = new Uint8Array(N);

    const resize = () => {
      W = wrap.clientWidth * 3;
      H = wrap.clientHeight * 3;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    sampleLogoPoints(N).then((p) => {
      pts = p;
      if (pendingStart) start();
    });

    const reset = () => {
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = (Math.max(W, H) / 3) * (0.7 + Math.random() * 0.7);
        px[i] = W / 2 + Math.cos(a) * r;
        py[i] = H / 2 + Math.sin(a) * r;
        vx[i] = (Math.random() - 0.5) * 2;
        vy[i] = (Math.random() - 0.5) * 2;
        sz[i] = 1.0 + Math.random() * 1.5;
        ci[i] = i % COLORS.length;
      }
    };

    let last = 0;
    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const t = now - startT;
      const dt = Math.min(50, now - last) / 16.667;
      last = now;

      ctx.clearRect(0, 0, W, H);
      if (!pts) return;

      let cAlpha = 1;
      if (t > DUR_ASSEMBLE + DUR_HOLD) {
        cAlpha = Math.max(0, 1 - (t - DUR_ASSEMBLE - DUR_HOLD) / DUR_FADE);
      }
      const ip = Math.min(
        1,
        Math.max(0, (t - DUR_ASSEMBLE - DUR_HOLD * 0.4) / DUR_FADE)
      );
      img.style.opacity = String(ip * finalOpacity);

      ctx.globalCompositeOperation = "lighter";
      const SC = Math.min(W, H) / 3;
      const prog = Math.min(1, t / DUR_ASSEMBLE);
      const k = 0.012 + prog * 0.07;
      const sw = 0.05 * (1 - prog);
      const dampDt = Math.pow(0.86, dt);

      for (let i = 0; i < N; i++) {
        const tx = W / 2 + pts[i * 2] * SC;
        const ty = H / 2 + pts[i * 2 + 1] * SC;
        const dx = tx - px[i],
          dy = ty - py[i];
        vx[i] += (dx * k + -dy * sw * 0.4) * dt;
        vy[i] += (dy * k + dx * sw * 0.4) * dt;
        vx[i] *= dampDt;
        vy[i] *= dampDt;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;

        ctx.globalAlpha = Math.min(1, 0.85 * cAlpha);
        const s = sz[i];
        ctx.drawImage(sprites[ci[i]], px[i] - s, py[i] - s, s * 2, s * 2);
      }
      ctx.globalAlpha = 1;

      if (t > TOTAL) {
        running = false;
        ctx.clearRect(0, 0, W, H);
        img.style.opacity = String(finalOpacity);
      }
    };

    const start = () => {
      if (!pts) {
        pendingStart = true;
        return;
      }
      cancelAnimationFrame(raf);
      reset();
      img.style.opacity = "0";
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "ev-spin 20s linear infinite";
      startT = performance.now();
      last = startT;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          start();
        } else {
          running = false;
          cancelAnimationFrame(raf);
          img.style.opacity = "0";
          ctx.clearRect(0, 0, W, H);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [finalOpacity]);

  return (
    <div
      ref={wrapRef}
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="false"
    >
      <style>{`@keyframes ev-spin { to { transform: rotate(360deg); } }`}</style>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: "300%", height: "300%" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={LOGO_SRC}
        alt="AETHON Core"
        className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_50px_rgba(54,233,210,0.55)]"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
