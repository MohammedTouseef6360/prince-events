import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");

function safeRead(name: string): any[] {
  try {
    const filePath = path.join(DB_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch { return []; }
}

function safeWrite(name: string, data: any[]) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(path.join(DB_DIR, `${name}.json`), JSON.stringify(data, null, 2));
  } catch {} // read-only filesystem
}

function readCollection(name: string): any[] {
  return safeRead(name);
}

function writeCollection(name: string, data: any[]) {
  safeWrite(name, data);
}

let idCounter = Date.now();
function generateId() {
  return (idCounter++).toString();
}

export const localDb = {
  menu: {
    find() {
      return readCollection("menu");
    },
    findById(id: string) {
      return readCollection("menu").find((i) => i._id === id) || null;
    },
    create(data: any) {
      const items = readCollection("menu");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      writeCollection("menu", items);
      return item;
    },
    findByIdAndUpdate(id: string, data: any) {
      const items = readCollection("menu");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      writeCollection("menu", items);
      return items[idx];
    },
    findByIdAndDelete(id: string) {
      const items = readCollection("menu");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      writeCollection("menu", items);
      return deleted[0];
    },
  },
  orders: {
    find() {
      return readCollection("orders");
    },
    create(data: any) {
      const items = readCollection("orders");
      const item = { _id: generateId(), ...data, status: "pending", createdAt: new Date().toISOString() };
      items.push(item);
      writeCollection("orders", items);
      return item;
    },
    findByIdAndUpdate(id: string, data: any) {
      const items = readCollection("orders");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      writeCollection("orders", items);
      return items[idx];
    },
    findByIdAndDelete(id: string) {
      const items = readCollection("orders");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      writeCollection("orders", items);
      return deleted[0];
    },
  },
  gallery: {
    find() {
      return readCollection("gallery");
    },
    create(data: any) {
      const items = readCollection("gallery");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      writeCollection("gallery", items);
      return item;
    },
    findByIdAndDelete(id: string) {
      const items = readCollection("gallery");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      writeCollection("gallery", items);
      return deleted[0];
    },
  },
  testimonials: {
    find() {
      return readCollection("testimonials");
    },
    create(data: any) {
      const items = readCollection("testimonials");
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      writeCollection("testimonials", items);
      return item;
    },
    findByIdAndDelete(id: string) {
      const items = readCollection("testimonials");
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1);
      writeCollection("testimonials", items);
      return deleted[0];
    },
  },
  settings: {
    findOne() {
      const raw = readCollection("settings");
      if (Array.isArray(raw)) return raw[0] || null;
      if (raw && typeof raw === "object") return raw;
      return null;
    },
    save(data: any) {
      const existing = this.findOne() || {};
      const merged = { ...existing, ...data };
      writeCollection("settings", [merged]);
      return merged;
    },
  },
};
