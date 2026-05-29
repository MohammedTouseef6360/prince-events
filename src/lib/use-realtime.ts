import { useState, useEffect, useRef } from "react";

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
        const res = await fetch(`${DB_URL}/${collection}.json`);
        const json = await res.json();
        if (mounted.current) setData(fta(json) as T[]);
      } catch {}
    }
    fetchData();
    intervalRef.current = setInterval(fetchData, 2000);
    return () => {
      mounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [collection]);

  return data;
}
