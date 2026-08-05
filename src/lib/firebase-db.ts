import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const DB_URL = process.env.FIREBASE_DATABASE_URL || "https://prince-events-8bb83-default-rtdb.firebaseio.com";

let adminReady = false;

function loadServiceAccount(): Record<string, string> | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      return JSON.parse(inline);
    } catch {
      return null;
    }
  }
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) {
    try {
      return JSON.parse(fs.readFileSync(envPath, "utf8"));
    } catch {
      return null;
    }
  }
  const local = path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(local)) {
    try {
      return JSON.parse(fs.readFileSync(local, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

function getAdmin() {
  const sa = loadServiceAccount();
  if (!sa) return null;
  if (!adminReady && getApps().length === 0) {
    initializeApp({ credential: cert(sa as any), databaseURL: DB_URL });
    adminReady = true;
  }
  return getDatabase();
}

const useAdmin = () => {
  try {
    return !!getAdmin();
  } catch {
    return false;
  }
};

const adminGetList = async (collection: string) => {
  const db = getAdmin()!;
  const snap = await db.ref(collection).once("value");
  const data = snap.val();
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ _id: key, ...val }));
};

const adminGetOne = async (collection: string, id: string) => {
  const db = getAdmin()!;
  const snap = await db.ref(`${collection}/${id}`).once("value");
  const data = snap.val();
  if (!data) return null;
  return { _id: id, ...data };
};

const adminAddOne = async (collection: string, data: any) => {
  const db = getAdmin()!;
  const ref = db.ref(collection).push();
  await ref.set({ ...data, createdAt: new Date().toISOString() });
  return { _id: ref.key, ...data, createdAt: new Date().toISOString() };
};

const adminSetOne = async (collection: string, id: string, data: any) => {
  const db = getAdmin()!;
  await db.ref(`${collection}/${id}`).set(data);
  return { _id: id, ...data };
};

const adminRemoveOne = async (collection: string, id: string) => {
  const db = getAdmin()!;
  const old = await adminGetOne(collection, id);
  if (!old) return null;
  await db.ref(`${collection}/${id}`).remove();
  return old;
};

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
  if (useAdmin()) return adminGetList(collection);
  try {
    const data = await fireFetch(`${DB_URL}/${collection}.json`);
    if (!data) return [];
    return Object.entries(data).map(([key, val]: [string, any]) => ({ _id: key, ...val }));
  } catch {
    return [];
  }
}

async function getOne(collection: string, id: string) {
  if (useAdmin()) return adminGetOne(collection, id);
  try {
    const data = await fireFetch(`${DB_URL}/${collection}/${id}.json`);
    if (!data) return null;
    return { _id: id, ...data };
  } catch {
    return null;
  }
}

async function addOne(collection: string, data: any) {
  if (useAdmin()) return adminAddOne(collection, data);
  try {
    const result = await fireFetch(`${DB_URL}/${collection}.json`, {
      method: "POST", body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
    });
    return { _id: result.name, ...data, createdAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

async function setOne(collection: string, id: string, data: any) {
  if (useAdmin()) return adminSetOne(collection, id, data);
  try {
    await fireFetch(`${DB_URL}/${collection}/${id}.json`, { method: "PUT", body: JSON.stringify(data) });
    return { _id: id, ...data };
  } catch {
    return null;
  }
}

async function removeOne(collection: string, id: string) {
  if (useAdmin()) return adminRemoveOne(collection, id);
  try {
    const old = await getOne(collection, id);
    if (!old) return null;
    await fireFetch(`${DB_URL}/${collection}/${id}.json`, { method: "DELETE" });
    return old;
  } catch {
    return null;
  }
}

async function findSettings() {
  if (useAdmin()) {
    const snap = await getAdmin()!.ref("settings").once("value");
    return snap.val();
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 8000);
  try {
    const res = await fetch(`${DB_URL}/settings.json`, { signal: c.signal });
    clearTimeout(t);
    return await res.json();
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function saveSettings(data: any) {
  const existing = (await findSettings()) || {};
  const merged = { ...existing, ...data };
  if (useAdmin()) {
    await getAdmin()!.ref("settings").set(merged);
    return merged;
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 8000);
  try {
    await fetch(`${DB_URL}/settings.json`, { method: "PUT", body: JSON.stringify(merged), signal: c.signal });
    clearTimeout(t);
  } catch {
    clearTimeout(t);
  }
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
    nextInvoiceNo: async () => {
      const year = new Date().getFullYear();
      let next: number | null = null;
      if (useAdmin()) {
        const db = getAdmin()!;
        const ref = db.ref("counters/invoice");
        await ref.transaction(
          (current: number | null) => (typeof current === "number" ? current + 1 : 1),
          (_err, committed, snap) => {
            if (committed && snap && snap.val() != null) next = snap.val();
          }
        );
        if (next != null) return `PE-${year}-${String(next).padStart(4, "0")}`;
      }
      const orders = await getList("orders");
      let max = 0;
      for (const o of orders) {
        const m = String(o.invoiceNo || "").match(/PE-\d{4}-(\d+)/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
      return `PE-${year}-${String(max + 1).padStart(4, "0")}`;
    },
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
