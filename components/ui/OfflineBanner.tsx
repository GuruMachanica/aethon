"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { health } from "@/lib/api";
import { ApiError } from "@/lib/api";

/**
 * Polls the backend health endpoint and shows a top banner when unreachable.
 * In mock mode the backend is always "reachable", so this stays hidden.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    const ping = async () => {
      try {
        await health.check();
        if (active) setOffline(false);
      } catch (e) {
        if (active) setOffline(e instanceof ApiError ? e.offline : true);
      }
    };
    ping();
    const id = setInterval(ping, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[110] flex items-center justify-center gap-2 bg-danger/90 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur"
        >
          <WifiOff className="h-4 w-4" />
          Backend offline — showing last-known or mock data. Reconnecting…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
