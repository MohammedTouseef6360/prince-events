const DB_URL = process.env.FIREBASE_DATABASE_URL || "https://prince-events-8bb83-default-rtdb.firebaseio.com";

async function fireFetch(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`Firebase ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function getList(collection: string) {
  try {
    const data = await fireFetch(`${DB_URL}/${collection}.json`);
    if (!data) return [];
    return Object.entries(data).map(([key, val]: [string, any]) => ({ _id: key, ...val }));
  } catch { return []; }
}

async function getOne(collection: string, id: string) {
  try {
    const data = await fireFetch(`${DB_URL}/${collection}/${id}.json`);
    if (!data) return null;
    return { _id: id, ...data };
  } catch { return null; }
}

async function addOne(collection: string, data: any) {
  try {
    const result = await fireFetch(`${DB_URL}/${collection}.json`, {
      method: "POST", body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
    });
    return { _id: result.name, ...data, createdAt: new Date().toISOString() };
  } catch { return null; }
}

async function setOne(collection: string, id: string, data: any) {
  try {
    await fireFetch(`${DB_URL}/${collection}/${id}.json`, { method: "PUT", body: JSON.stringify(data) });
    return { _id: id, ...data };
  } catch { return null; }
}

async function removeOne(collection: string, id: string) {
  try {
    const old = await getOne(collection, id);
    if (!old) return null;
    await fireFetch(`${DB_URL}/${collection}/${id}.json`, { method: "DELETE" });
    return old;
  } catch { return null; }
}

async function findSettings() {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 8000);
  try {
    const res = await fetch(`${DB_URL}/settings.json`, { signal: c.signal });
    clearTimeout(t);
    return await res.json();
  } catch { clearTimeout(t); return null; }
}

async function saveSettings(data: any) {
  const existing = (await findSettings()) || {};
  const merged = { ...existing, ...data };
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 8000);
  try {
    await fetch(`${DB_URL}/settings.json`, { method: "PUT", body: JSON.stringify(merged), signal: c.signal });
    clearTimeout(t);
  } catch { clearTimeout(t); }
  return merged;
}

export const firebaseDb = {
  menu: {
    find: () => getList("menu"),
    findById: (id: string) => getOne("menu", id),
    create: (data: any) => addOne("menu", data),
    findByIdAndUpdate: async (id: string, data: any) => {
      const item = await getOne("menu", id);
      if (!item) return null;
      return setOne("menu", id, { ...item, ...data });
    },
    findByIdAndDelete: (id: string) => removeOne("menu", id),
  },
  orders: {
    find: () => getList("orders"),
    create: (data: any) => addOne("orders", { ...data, status: "pending" }),
    findByIdAndUpdate: async (id: string, data: any) => {
      const item = await getOne("orders", id);
      if (!item) return null;
      return setOne("orders", id, { ...item, ...data });
    },
    findByIdAndDelete: (id: string) => removeOne("orders", id),
  },
  gallery: {
    find: () => getList("gallery"),
    create: (data: any) => addOne("gallery", data),
    findByIdAndDelete: (id: string) => removeOne("gallery", id),
  },
  testimonials: {
    find: () => getList("testimonials"),
    create: (data: any) => addOne("testimonials", data),
    findByIdAndDelete: (id: string) => removeOne("testimonials", id),
  },
  settings: {
    findOne: findSettings,
    save: saveSettings,
  },
};
