"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { WS_BASE, IS_MOCK } from "@/lib/api";

type Status = "connecting" | "open" | "closed";

/**
 * Reusable WebSocket hook.
 * - Connects to `${WS_BASE}${path}`
 * - Calls onMessage with each parsed JSON payload
 * - Auto-reconnects with exponential backoff (capped at 30s)
 * - Cleans up on unmount
 * - In mock mode (NEXT_PUBLIC_USE_MOCK=true) it does NOT open a socket;
 *   use the returned `mock` flag to drive simulated data instead.
 */
export function useWebSocket<T = unknown>(
  path: string,
  onMessage: (data: T) => void,
  enabled = true
) {
  const [status, setStatus] = useState<Status>("connecting");
  const ws = useRef<WebSocket | null>(null);
  const retries = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled || IS_MOCK) return;
    setStatus("connecting");
    let socket: WebSocket;
    try {
      socket = new WebSocket(`${WS_BASE}${path}`);
    } catch {
      scheduleReconnect();
      return;
    }
    ws.current = socket;

    socket.onopen = () => {
      retries.current = 0;
      setStatus("open");
    };
    socket.onmessage = (e) => {
      try {
        cbRef.current(JSON.parse(e.data) as T);
      } catch {
        /* ignore non-JSON frames */
      }
    };
    socket.onclose = () => {
      setStatus("closed");
      scheduleReconnect();
    };
    socket.onerror = () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled]);

  function scheduleReconnect() {
    if (!enabled || IS_MOCK) return;
    const delay = Math.min(1000 * 2 ** retries.current, 30000);
    retries.current += 1;
    timer.current = setTimeout(connect, delay);
  }

  useEffect(() => {
    connect();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (ws.current) {
        ws.current.onclose = null; // prevent reconnect on intentional close
        ws.current.close();
      }
    };
  }, [connect]);

  return { status, mock: IS_MOCK };
}
