"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

type Facility = {
  id: string;
  title: string;
  description: string;
  hours: string;
  days: string;
  image: string;
};

// dark / industrial backgrounds (Unsplash) — match the AETHON aesthetic
const facilities: Facility[] = [
  {
    id: "refinery",
    title: "Refinery Unit-4",
    description: "Coke-oven battery · live gas + permit monitoring",
    days: "Monday to Sunday",
    hours: "24 / 7 · always-on",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "plant",
    title: "Processing Plant",
    description: "Pressure vessels · vibration + thermal intelligence",
    days: "Monday to Saturday",
    hours: "06 AM – 10 PM",
    image:
      "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "control",
    title: "Control Room",
    description: "Command center · unified operations brain",
    days: "Monday to Sunday",
    hours: "09 AM – 07 PM",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80",
  },
];

export function CardAccordion() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="relative px-6 py-16 sm:py-28">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <span className="chip mb-5">Deployed across the facility</span>
        <h2 className="display text-3xl font-semibold sm:text-4xl">
          One brain. <span className="text-gradient-teal">Every zone.</span>
        </h2>
        <p className="mt-4 text-muted">
          AETHON watches every corner of the plant in real time. Hover a zone to look inside.
        </p>
      </Reveal>

      <div
        className="mx-auto flex max-w-6xl flex-col gap-4 sm:h-[26rem] sm:flex-row"
        onMouseLeave={() => setActive(null)}
      >
        {facilities.map((f) => {
          const isActive = active === f.id;
          return (
            <motion.article
              key={f.id}
              layout
              onMouseEnter={() => setActive(f.id)}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ flexGrow: isActive ? 3 : active ? 0.8 : 1 }}
              className="group relative h-64 cursor-pointer overflow-hidden rounded-[2rem] border border-border sm:h-full sm:min-w-0"
            >
              {/* background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${f.image})` }}
              />
              {/* dark gradient overlay for legibility + teal tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/50 to-abyss/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent" />

              {/* top row: title + (expanded) arrow button */}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
                <motion.div layout="position">
                  <h3 className="display text-xl font-semibold text-white drop-shadow-lg">
                    {f.title}
                  </h3>
                  <p className="mt-1 max-w-[16rem] text-sm text-white/75 drop-shadow">
                    {f.description}
                  </p>
                </motion.div>

                <AnimatePresence>
                  {isActive && (
                    <motion.button
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                      aria-label={`Open ${f.title}`}
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-abyss shadow-glow-teal"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* bottom row: Navigate pill + (expanded) schedule */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <motion.button
                  layout="position"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <MapPin className="h-4 w-4" />
                  Navigate
                </motion.button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.35, delay: 0.18 }}
                      className="text-right text-xs leading-relaxed text-white/80 drop-shadow"
                    >
                      <p>{f.days}</p>
                      <p className="font-mono text-tealGlow">{f.hours}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
