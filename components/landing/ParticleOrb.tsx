"use client";
import { useEffect, useRef, useState } from "react";
import "./ParticleOrb.css";

/**
 * AETHON particle background — pure Canvas 2D, no dependencies.
 *
 * Lifecycle (infinite loop):
 *   scattered fragments → swirl + assemble into the AETHON hexagon logo
 *   → hold, breathing → morph into a rotating 3D particle orb
 *   → orb floats/pulses while stray particles break away and rejoin
 *   → dissolve outward → reassemble …
 *
 * Runs on all devices (lighter particle count on phones), pauses off-screen,
 * respects prefers-reduced-motion.
 */

// brand palette: teal core, deep-teal body, bright-teal + gold accents
const PALETTE = [
  { color: "54,233,210", weight: 0.4 }, // tealGlow
  { color: "31,184,166", weight: 0.3 }, // teal
  { color: "234,250,246", weight: 0.14 }, // warm-white highlight
  { color: "244,212,136", weight: 0.16 }, // gold sparkle
];

// timeline (ms)
const T_ASSEMBLE = 5000;
const T_LOGO = 4500;
const T_MORPH = 3200;
const T_ORB = 20000;
const T_DISSOLVE = 2800;
const CYCLE = T_ASSEMBLE + T_LOGO + T_MORPH + T_ORB + T_DISSOLVE;

const P_COUNT_DESKTOP = 1200;
const P_COUNT_MOBILE = 450;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function pickColorIndex(): number {
  let r = Math.random();
  for (let i = 0; i < PALETTE.length; i++) {
    if (r < PALETTE[i].weight) return i;
    r -= PALETTE[i].weight;
  }
  return 0;
}

/** soft round glow sprite per palette color (drawImage is cheaper than per-particle gradients) */
function makeSprites(): HTMLCanvasElement[] {
  return PALETTE.map(({ color }) => {
    const s = document.createElement("canvas");
    s.width = s.height = 32;
    const g = s.getContext("2d")!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(255,255,255,0.9)`);
    grad.addColorStop(0.25, `rgba(${color},0.8)`);
    grad.addColorStop(0.6, `rgba(${color},0.25)`);
    grad.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return s;
  });
}

/**
 * Generate evenly-distributed points filling a CIRCLE (sunflower / golden-angle
 * pattern), normalized + centered to [-0.5, 0.5]. Guarantees a clean round disc.
 */
function makeCirclePoints(count: number): Float32Array {
  const out = new Float32Array(count * 2);
  const R = 0.5; // fills the normalized space
  for (let i = 0; i < count; i++) {
    // sqrt distribution → uniform area density (no center clumping)
    const r = Math.sqrt((i + 0.5) / count) * R;
    const a = GOLDEN * i;
    out[i * 2] = Math.cos(a) * r;
    out[i * 2 + 1] = Math.sin(a) * r;
  }
  return out;
}

export default function ParticleOrb({ opacity = 0.6 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d")!;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const N = isDesktop ? P_COUNT_DESKTOP : P_COUNT_MOBILE;
    const dpr = 1; // dim soft background — extra resolution invisible, costs 2-4x pixels
    let W = 0, H = 0, CX = 0, CY = 0, SCALE = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    const logoPts: Float32Array = makeCirclePoints(N);
    const sprites = makeSprites();

    const resize = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W / 2;
      CY = isDesktop ? H / 2 : H * 0.5;
      SCALE = Math.min(W, H) * (isDesktop ? 1.05 : 1.2);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ---- particles ----
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);
    const size = new Float32Array(N);
    const ci = new Uint8Array(N);
    const sphX = new Float32Array(N);
    const sphY = new Float32Array(N);
    const sphZ = new Float32Array(N);
    const freeUntil = new Float32Array(N);
    const kicked = new Int32Array(N);

    for (let i = 0; i < N; i++) {
      px[i] = Math.random() * (W || 800);
      py[i] = Math.random() * (H || 600);
      vx[i] = (Math.random() - 0.5) * 0.6;
      vy[i] = (Math.random() - 0.5) * 0.6;
      size[i] = 1.4 + Math.random() * 2.4;
      ci[i] = pickColorIndex();
      const t = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - t * t));
      const th = GOLDEN * i;
      sphX[i] = Math.cos(th) * r;
      sphY[i] = t;
      sphZ[i] = Math.sin(th) * r;
      freeUntil[i] = 0;
      kicked[i] = -1;
    }

    // phase boundaries
    const A = T_ASSEMBLE;
    const B = A + T_LOGO;
    const C = B + T_MORPH;
    const D = C + T_ORB;

    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible) return;
      const dtRaw = now - last;
      last = now;
      const dt = Math.min(dtRaw, 50) / 16.667;

      const tc = (now - t0) % CYCLE;
      const cycleN = Math.floor((now - t0) / CYCLE);
      const tSec = now * 0.001;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      let env = 1;
      if (tc > D) env = 1 - ((tc - D) / T_DISSOLVE) * 0.65;
      else if (tc < A) env = 0.35 + (tc / A) * 0.65;

      const orbR = SCALE * 0.42 * (1 + 0.035 * Math.sin(tSec * 1.1));
      const floatX = Math.sin(tSec * 0.31) * SCALE * 0.03;
      const floatY = Math.cos(tSec * 0.23) * SCALE * 0.045;
      const rotY = tSec * 0.28;
      const rotX = 0.42 + Math.sin(tSec * 0.17) * 0.12;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        let k = 0, damp = 0.9, tx = 0, ty = 0, hasTarget = true;
        let depthAlpha = 1, depthSize = 1;

        if (tc < B && logoPts) {
          tx = CX + logoPts[i * 2] * SCALE;
          ty = CY + logoPts[i * 2 + 1] * SCALE;
          if (tc < A) {
            k = 0.012 + (tc / A) * 0.02;
            damp = 0.9;
            const dx = tx - px[i], dy = ty - py[i];
            const sw = 0.05 * (1 - tc / A);
            vx[i] += -dy * sw * 0.02 * dt;
            vy[i] += dx * sw * 0.02 * dt;
          } else {
            k = 0.04;
            damp = 0.82;
            tx += Math.sin(tSec * 1.4 + i * 0.37) * 1.6;
            ty += Math.cos(tSec * 1.1 + i * 0.61) * 1.6;
          }
        } else if (tc < D || !logoPts) {
          let x = sphX[i], y = sphY[i], z = sphZ[i];
          let x1 = x * cosY + z * sinY;
          let z1 = -x * sinY + z * cosY;
          let y1 = y * cosX - z1 * sinX;
          let z2 = y * sinX + z1 * cosX;
          const persp = 2.6 / (2.6 - z2 * 0.9);
          tx = CX + floatX + x1 * orbR * persp;
          ty = CY + floatY + y1 * orbR * persp;
          depthAlpha = 0.35 + ((z2 + 1) / 2) * 0.65;
          depthSize = 0.6 + persp * 0.5;

          const morphIn = tc < C ? (tc - B) / T_MORPH : 1;
          k = 0.02 + morphIn * 0.07;
          damp = 0.8;

          if (tc >= C) {
            if (freeUntil[i] === 0 && Math.random() < 0.0006) {
              freeUntil[i] = now + 1200 + Math.random() * 2600;
              const ang = Math.random() * Math.PI * 2;
              const imp = 1.5 + Math.random() * 2.5;
              vx[i] += Math.cos(ang) * imp;
              vy[i] += Math.sin(ang) * imp;
            }
            if (freeUntil[i] > 0) {
              if (now < freeUntil[i]) {
                hasTarget = false;
                damp = 0.985;
              } else freeUntil[i] = 0;
            }
          }
        } else {
          hasTarget = false;
          damp = 0.97;
          if (kicked[i] !== cycleN) {
            kicked[i] = cycleN;
            const dx = px[i] - CX, dy = py[i] - CY;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const imp = 1 + Math.random() * 3;
            vx[i] += (dx / d) * imp + (Math.random() - 0.5) * 1.5;
            vy[i] += (dy / d) * imp + (Math.random() - 0.5) * 1.5;
          }
        }

        if (hasTarget) {
          vx[i] += (tx - px[i]) * k * dt;
          vy[i] += (ty - py[i]) * k * dt;
        }
        const dampDt = Math.pow(damp, dt);
        vx[i] *= dampDt;
        vy[i] *= dampDt;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;

        const s = size[i] * depthSize;
        ctx.globalAlpha = Math.min(1, 0.55 * env * depthAlpha);
        ctx.drawImage(sprites[ci[i]], px[i] - s, py[i] - s, s * 2, s * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(wrap);
    const onVis = () => {
      running = document.visibilityState === "visible";
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className="aethon-particle-bg" style={{ opacity }} aria-hidden="true">
      <div className="aethon-particle-ambient" />
      <canvas ref={canvasRef} />
    </div>
  );
}
