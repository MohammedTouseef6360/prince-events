import { useState, useEffect, useRef, useCallback } from "react";

const COLLECTION_MAP: Record<string, string> = {
  menu: "/api/menu",
  testimonials: "/api/testimonials",
  gallery: "/api/gallery",
};

const DB_URL = "https://prince-events-8bb83-default-rtdb.firebaseio.com";

function fta(data: any): any[] {
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ _id: key, ...val }));
}

interface UseRealtimeResult<T> {
  data: T[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useRealtime<T = any>(collection: string): UseRealtimeResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const mounted = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError("");
    let active = true;

    function fetchData() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const apiPath = COLLECTION_MAP[collection];
      const url = apiPath || `${DB_URL}/${collection}.json`;
      fetch(url, { signal: controller.signal }).then(r => { clearTimeout(timeout); if (!r.ok) throw new Error("Failed to load"); return r.json(); }).then(json => {
        if (!active || !mounted.current) return;
        const list = Array.isArray(json) ? json : fta(json);
        setData(list as T[]);
        setError("");
      }).catch((err: any) => {
        clearTimeout(timeout);
        if (!active || !mounted.current) return;
        if (err?.name !== "AbortError") setError("Unable to load content. Please check your connection.");
      }).finally(() => {
        if (active && mounted.current) setLoading(false);
      });
    }
    fetchData();
    intervalRef.current = setInterval(fetchData, 60000);
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchData();
        intervalRef.current = setInterval(fetchData, 60000);
      }
    };
    const onBlur = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      active = false;
      mounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [collection, tick]);

  return { data, loading, error, refetch };
}
