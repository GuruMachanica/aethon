"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import type { GraphData, GraphNode } from "@/lib/types";

const color: Record<string, string> = {
  equipment: "#36e9d2",
  regulation: "#f4d488",
  procedure: "#1fb8a6",
  incident: "#e08a8a",
  document: "#7fa39c",
};

/** Animation-heavy SVG graph — lazy-loaded client-side. */
export default function GraphCanvas({
  data,
  nodes,
}: {
  data: GraphData;
  nodes: GraphNode[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const find = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="glass-glow mt-8 overflow-hidden p-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-base/60 sm:aspect-[16/10]">
        <div className="aurora absolute inset-0 opacity-20" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {data.edges.map((e, i) => {
            const na = find(e.from);
            const nb = find(e.to);
            if (!na || !nb) return null;
            const lit = hover === e.from || hover === e.to;
            return (
              <motion.line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={lit ? "#36e9d2" : "#13413c"}
                strokeWidth={lit ? 0.5 : 0.3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {data.edges.map((e, i) => {
            const na = find(e.from);
            const nb = find(e.to);
            if (!na || !nb) return null;
            return (
              <motion.circle
                key={`p${i}`}
                r={0.7}
                fill="#f4d488"
                initial={{ cx: na.x, cy: na.y, opacity: 0 }}
                animate={{ cx: [na.x, nb.x], cy: [na.y, nb.y], opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {nodes.map((n, i) => (
          <motion.div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 180 }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            whileHover={{ scale: 1.15 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 backdrop-blur-md"
                style={{
                  borderColor: color[n.type] ?? "#7fa39c",
                  background: `${color[n.type] ?? "#7fa39c"}1a`,
                  boxShadow: hover === n.id ? `0 0 24px ${color[n.type] ?? "#7fa39c"}` : "none",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color[n.type] ?? "#7fa39c" }} />
              </span>
              <span className="whitespace-nowrap rounded-full bg-base/80 px-2 py-0.5 font-mono text-[9px] text-text backdrop-blur">
                {n.label}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const GRAPH_COLORS = color;
