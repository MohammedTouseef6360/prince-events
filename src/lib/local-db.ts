import fs from "fs";
import path from "path";
import os from "os";

const SEED_DIR = path.join(process.cwd(), "data");
const TMP_DIR = path.join(os.tmpdir(), "prince-events-data");

const memoryStore: Record<string, any[]> = {};

function loadCollection(name: string): any[] {
  if (memoryStore[name]) return memoryStore[name];
  const seed = tryRead(path.join(SEED_DIR, `${name}.json`));
  const tmp = tryRead(path.join(TMP_DIR, `${name}.json`));
  const merged = [...(Array.isArray(seed) ? seed : []), ...(Array.isArray(tmp) ? tmp : [])];
  memoryStore[name] = merged;
  return merged;
}

function tryRead(filePath: string): any[] {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {}
  return [];
}

function persist(name: string) {
  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    const data = memoryStore[name] || [];
    fs.writeFileSync(path.join(TMP_DIR, `${name}.json`), JSON.stringify(data, null, 2));
  } catch {}
}

let idCounter = Date.now();
function generateId() {
  return (idCounter++).toString();
}

export const localDb = {
  menu: {
    find() {
      return loadCollection("menu");
    },
    findById(id: string) {
      return loadCollection("menu").find((i: any) => i._id === id) || null;
    },
    create(data: any) {
      const items = loadCollection("menu");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      memoryStore.menu = items;
      persist("menu");
      return item;
    },
    findByIdAndUpdate(id: string, data: any) {
      const items = loadCollection("menu");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      memoryStore.menu = items;
      persist("menu");
      return items[idx];
    },
    findByIdAndDelete(id: string) {
      const items = loadCollection("menu");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      memoryStore.menu = items;
      persist("menu");
      return deleted[0];
    },
  },
  orders: {
    find() {
      return loadCollection("orders");
    },
    create(data: any) {
      const items = loadCollection("orders");
      const item = { _id: generateId(), ...data, status: "pending", createdAt: new Date().toISOString() };
      items.push(item);
      memoryStore.orders = items;
      persist("orders");
      return item;
    },
    findByIdAndUpdate(id: string, data: any) {
      const items = loadCollection("orders");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      memoryStore.orders = items;
      persist("orders");
      return items[idx];
    },
    findByIdAndDelete(id: string) {
      const items = loadCollection("orders");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      memoryStore.orders = items;
      persist("orders");
      return deleted[0];
    },
  },
  gallery: {
    find() {
      return loadCollection("gallery");
    },
    create(data: any) {
      const items = loadCollection("gallery");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      memoryStore.gallery = items;
      persist("gallery");
      return item;
    },
    findByIdAndDelete(id: string) {
      const items = loadCollection("gallery");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      memoryStore.gallery = items;
      persist("gallery");
      return deleted[0];
    },
  },
  testimonials: {
    find() {
      return loadCollection("testimonials");
    },
    create(data: any) {
      const items = loadCollection("testimonials");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      memoryStore.testimonials = items;
      persist("testimonials");
      return item;
    },
    findByIdAndDelete(id: string) {
      const items = loadCollection("testimonials");
      const idx = items.findIndex((i: any) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      memoryStore.testimonials = items;
      persist("testimonials");
      return deleted[0];
    },
  },
  settings: {
    findOne() {
      const raw = loadCollection("settings");
      if (Array.isArray(raw)) return raw[0] || null;
      if (raw && typeof raw === "object") return raw as any;
      return null;
    },
    save(data: any) {
      const existing = this.findOne() || {};
      const merged = { ...existing, ...data };
      memoryStore.settings = [merged];
      persist("settings");
      return merged;
    },
  },
};
