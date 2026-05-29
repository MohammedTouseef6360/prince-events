const DB_URL = "https://prince-events-8bb83-default-rtdb.firebaseio.com";

const menuItems = [
  { name: "Gobi Manchurian", price: 120, category: "Snacks", image: "", description: "Crispy cauliflower in Indo-Chinese sauce", featured: true, inStock: true, pricingType: "per_plate", pricingLabel: "Per Plate" },
  { name: "Chicken 65", price: 200, category: "Non-Veg", image: "", description: "Spicy deep-fried chicken", featured: true, inStock: true, pricingType: "per_plate", pricingLabel: "Per Plate" },
  { name: "Pani Puri", price: 60, category: "Snacks", image: "", description: "Crispy puris with flavored water", featured: true, inStock: true, pricingType: "per_plate", pricingLabel: "Per Plate" },
  { name: "Masala Dosa", price: 100, category: "Snacks", image: "", description: "Crispy rice crepe with potato filling", featured: true, inStock: true, pricingType: "per_plate", pricingLabel: "Per Plate" },
  { name: "Mango Lassi", price: 80, category: "Beverages", image: "", description: "Chilled yogurt mango drink", featured: false, inStock: true, pricingType: "per_plate", pricingLabel: "Per Glass" },
  { name: "Biryani", price: 250, category: "Non-Veg", image: "", description: "Fragrant rice layered with spiced chicken", featured: true, inStock: true, pricingType: "per_plate", pricingLabel: "Per Plate" },
];

const defaultSettings = {
  businessName: "PRINCE EVENTS",
  tagline: "We Serve You Smile",
  phone: "+91 8618648069",
  instagram: "prince_events_001",
  aboutUs: "",
  aboutUsKN: "",
  aboutUsHI: "",
  address: "Bengaluru, Karnataka",
  freeRadius: 10,
  travelChargePerKm: 10,
  adminPassword: "prince@123",
  currency: "₹",
};

async function seed() {
  console.log("Seeding Firebase...");

  // Clear existing data
  await fetch(`${DB_URL}/menu.json`, { method: "DELETE" });
  await fetch(`${DB_URL}/orders.json`, { method: "DELETE" });
  await fetch(`${DB_URL}/gallery.json`, { method: "DELETE" });
  await fetch(`${DB_URL}/testimonials.json`, { method: "DELETE" });
  await fetch(`${DB_URL}/settings.json`, { method: "DELETE" });

  // Seed menu
  for (const item of menuItems) {
    const res = await fetch(`${DB_URL}/menu.json`, {
      method: "POST",
      body: JSON.stringify({ ...item, createdAt: new Date().toISOString() }),
    });
    const result = await res.json();
    console.log(`  Added menu item "${item.name}" with key ${result.name}`);
  }

  // Seed settings
  await fetch(`${DB_URL}/settings.json`, {
    method: "PUT",
    body: JSON.stringify(defaultSettings),
  });
  console.log("  Settings saved");

  console.log("Done! Firebase is seeded.");
}

seed().catch(console.error);
