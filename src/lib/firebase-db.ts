const DB_URL = process.env.FIREBASE_DATABASE_URL || "https://prince-events-8bb83-default-rtdb.firebaseio.com";

async function getList(collection: string) {
  const res = await fetch(`${DB_URL}/${collection}.json`);
  const data = await res.json();
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ _id: key, ...val }));
}

async function getOne(collection: string, id: string) {
  const res = await fetch(`${DB_URL}/${collection}/${id}.json`);
  const data = await res.json();
  if (!data) return null;
  return { _id: id, ...data };
}

async function addOne(collection: string, data: any) {
  const res = await fetch(`${DB_URL}/${collection}.json`, {
    method: "POST", body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
  });
  const result = await res.json();
  return { _id: result.name, ...data, createdAt: new Date().toISOString() };
}

async function setOne(collection: string, id: string, data: any) {
  await fetch(`${DB_URL}/${collection}/${id}.json`, { method: "PUT", body: JSON.stringify(data) });
  return { _id: id, ...data };
}

async function removeOne(collection: string, id: string) {
  const old = await getOne(collection, id);
  if (!old) return null;
  await fetch(`${DB_URL}/${collection}/${id}.json`, { method: "DELETE" });
  return old;
}

async function findSettings() {
  const res = await fetch(`${DB_URL}/settings.json`);
  return await res.json();
}

async function saveSettings(data: any) {
  const existing = (await findSettings()) || {};
  const merged = { ...existing, ...data };
  await fetch(`${DB_URL}/settings.json`, { method: "PUT", body: JSON.stringify(merged) });
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
