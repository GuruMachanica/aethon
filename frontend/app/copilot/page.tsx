"use client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Send, FileText, Sparkles, Hexagon, AlertTriangle } from "lucide-react";
import { copilot, ApiError } from "@/lib/api";
import type { Source } from "@/lib/types";

type Msg = {
  role: "user" | "ai";
  text: string;
  sources?: Source[];
  confidence?: number;
  error?: boolean;
};

const suggestions = [
  "Why did Pump P-204 fail three times?",
  "Which procedures violate OISD-116?",
  "Does SOP-44 comply with confined-space entry law?",
];

export default function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function ask(q: string) {
    if (!q.trim() || thinking) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    try {
      const res = await copilot.query(q);
      setMsgs((m) => [
        ...m,
        res.answer?.trim()
          ? {
              role: "ai",
              text: res.answer,
              sources: res.sources ?? [],
              confidence: res.confidence,
            }
          : {
              role: "ai",
              text: "No relevant information found in the corpus for that question. Try rephrasing, or ingest more documents.",
            },
      ]);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.offline
          ? "Backend offline — couldn't reach the brain. Check the server is running."
          : e instanceof ApiError
            ? e.message
            : "Something went wrong answering that. Please try again.";
      setMsgs((m) => [...m, { role: "ai", text: msg, error: true }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <PageContainer size="chat" flush>
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-tealGlow">
              Expert Copilot
            </p>
            <h1 className="display mt-1 text-2xl font-semibold sm:text-3xl">Ask the Brain</h1>
          </div>

          <div className="flex-1 space-y-5" aria-live="polite" aria-atomic="false">
            {msgs.length === 0 && !thinking && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal/30 bg-teal/10 text-tealGlow">
                  <Hexagon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <p className="text-sm text-muted">
                  Ask anything across every document your plant has ever produced.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "ai" && (
                    <span
                      className={`mr-3 mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-lg border ${
                        m.error
                          ? "border-danger/40 bg-danger/10 text-danger"
                          : "border-teal/30 bg-teal/10 text-tealGlow"
                      }`}
                    >
                      {m.error ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Hexagon className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] sm:max-w-lg ${
                      m.role === "user"
                        ? "glass bg-surface2/70 px-4 py-3 text-sm"
                        : m.error
                          ? "glass border-danger/30 bg-danger/5 p-4 text-sm leading-relaxed"
                          : "glass-glow border-teal/20 p-4 text-sm leading-relaxed"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.sources && m.sources.length > 0 && (
                      <>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.sources.map((s, si) => (
                            <span
                              key={si}
                              title={s.snippet}
                              className="chip cursor-help"
                            >
                              <FileText className="h-3 w-3" /> {s.doc_name} · p.{s.page}
                            </span>
                          ))}
                        </div>
                        {typeof m.confidence === "number" && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted">
                              confidence
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${m.confidence}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full rounded-full bg-gradient-to-r from-teal to-tealGlow"
                              />
                            </div>
                            <span className="font-mono text-[10px] text-tealGlow">
                              {m.confidence}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-tealGlow">
                  <Sparkles className="h-4 w-4 animate-pulseGlow" />
                </span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-2 w-2 rounded-full bg-tealGlow"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* suggestions */}
          <div className="mb-3 mt-6 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                disabled={thinking}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-all hover:border-teal/40 hover:text-tealGlow disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="glass flex items-center gap-2 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask across every document your plant has ever produced…"
              aria-label="Ask the copilot a question"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={thinking}
              aria-label="Send question"
              className="btn-gold sheen !p-3 disabled:opacity-50"
            >
              <Send className="relative z-10 h-4 w-4" />
            </motion.button>
          </form>
      </PageContainer>
    </div>
  );
}
