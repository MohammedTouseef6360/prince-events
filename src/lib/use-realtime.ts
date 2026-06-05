import { useState, useEffect, useRef } from "react";

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

export function useRealtime<T = any>(collection: string): T[] {
  const [data, setData] = useState<T[]>([]);
  const mounted = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    mounted.current = true;
    async function fetchData() {
      try {
        const apiPath = COLLECTION_MAP[collection];
        if (apiPath) {
          const res = await fetch(apiPath);
          const json = await res.json();
          if (mounted.current) {
            const list = Array.isArray(json) ? json : fta(json);
            setData(list as T[]);
          }
        } else {
          const res = await fetch(`${DB_URL}/${collection}.json`);
          const json = await res.json();
          if (mounted.current) setData(fta(json) as T[]);
        }
      } catch {}
    }
    fetchData();
    intervalRef.current = setInterval(fetchData, 3000);
    return () => {
      mounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [collection]);

  return data;
}
