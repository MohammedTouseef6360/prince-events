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
    function fetchData() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const apiPath = COLLECTION_MAP[collection];
      const url = apiPath || `${DB_URL}/${collection}.json`;
      fetch(url, { signal: controller.signal }).then(r => { clearTimeout(timeout); return r.json(); }).then(json => {
        if (!mounted.current) return;
        const list = Array.isArray(json) ? json : fta(json);
        setData(list as T[]);
      }).catch(() => { clearTimeout(timeout); });
    }
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => {
      mounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [collection]);

  return data;
}
