"use client";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  Hexagon,
  ChevronDown,
  LayoutDashboard,
  MessageSquareText,
  Share2,
  ShieldCheck,
  Wrench,
  Brain,
  UploadCloud,
  Target,
} from "lucide-react";

// top-level nav = home-page sections only (smooth-scroll anchors)
const links = [
  { label: "Problem", href: "#problem" },
  { label: "Agents", href: "#features" },
  { label: "Zones", href: "#zones" },
  { label: "Platform", href: "#platform" },
];

// full app menu grouped under the "Modules" dropdown (mirrors the sidebar)
const modules = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, desc: "Operations console" },
  { label: "Copilot", href: "/copilot", icon: MessageSquareText, desc: "Ask the brain — cited answers" },
  { label: "Knowledge Graph", href: "/knowledge-graph", icon: Share2, desc: "Traversable entity relationships" },
  { label: "Maintenance & RCA", href: "/rca", icon: Wrench, desc: "Root-cause + predictive" },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck, desc: "OISD · DGMS · Factory Act" },
  { label: "Knowledge Cliff", href: "/knowledge-cliff", icon: Brain, desc: "Capture retiring expertise" },
  { label: "Documents", href: "/upload", icon: UploadCloud, desc: "Ingest & index the corpus" },
  { label: "Scoreboard", href: "/scoreboard", icon: Target, desc: "Measured accuracy" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 30));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500 ${
          scrolled ? "glass mx-4 rounded-full px-6 py-2 md:mx-auto md:max-w-5xl" : ""
        }`}
      >
        <Link href="/" className="group flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-tealGlow drop-shadow-[0_0_8px_rgba(54,233,210,0.6)]"
          >
            <Hexagon className="h-6 w-6" strokeWidth={1.5} />
          </motion.span>
          <span className="display text-xl font-semibold tracking-tight">AETHON</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group relative text-sm text-muted transition-colors hover:text-text"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-teal to-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {/* Modules dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="group flex items-center gap-1 text-sm text-muted transition-colors hover:text-text">
              Modules
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full w-72 pt-4"
                >
                  <div className="glass-glow overflow-hidden p-2">
                    {modules.map((m) => (
                      <Link
                        key={m.label}
                        href={m.href}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-teal/10"
                      >
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-border bg-base/60 text-muted transition-colors group-hover:border-teal/40 group-hover:text-tealGlow">
                          <m.icon className="h-4 w-4" strokeWidth={1.6} />
                        </span>
                        <span>
                          <span className="block text-sm text-text">{m.label}</span>
                          <span className="block text-[11px] text-muted">{m.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="btn-gold sheen !px-4 !py-2 text-sm sm:!px-6 sm:!py-3"
        >
          <span className="relative z-10">Enter Console</span>
        </Link>
      </nav>
    </motion.header>
  );
}
