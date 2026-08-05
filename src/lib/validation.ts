import { z } from "zod";

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid phone");

export const orderSchema = z.object({
  customerName: z.string().min(1).max(100),
  phone: phoneSchema,
  date: z.string().min(1).max(20),
  venue: z.string().min(1).max(200),
  time: z.string().min(1).max(20),
  mealType: z.string().optional().default("Dinner"),
  note: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1).max(200),
        qty: z.number().int().positive().max(1000),
        price: z.number().nonnegative().max(1000000),
        pricingType: z.string().optional(),
      })
    )
    .min(1),
  travelCharge: z.number().nonnegative().max(1000000).optional().default(0),
  subtotal: z.number().nonnegative().max(1000000).optional().default(0),
  total: z.number().nonnegative().max(1000000).optional().default(0),
  invoiceNo: z.string().max(30).optional(),
});

export const orderUpdateSchema = z
  .object({
    customerName: z.string().min(1).max(100).optional(),
    phone: phoneSchema.optional(),
    date: z.string().max(20).optional(),
    venue: z.string().max(200).optional(),
    time: z.string().max(20).optional(),
    mealType: z.string().max(20).optional(),
    note: z.string().max(1000).optional(),
    items: z
      .array(
        z.object({
          itemName: z.string().min(1).max(200),
          qty: z.number().int().positive().max(1000),
          price: z.number().nonnegative().max(1000000),
          pricingType: z.string().optional(),
        })
      )
      .optional(),
    travelCharge: z.number().nonnegative().max(1000000).optional(),
    subtotal: z.number().nonnegative().max(1000000).optional(),
    total: z.number().nonnegative().max(1000000).optional(),
    status: z.enum(["pending", "confirmed", "preparing", "delivered"]).optional(),
    invoiceImage: z.string().max(5000).optional(),
    invoiceNo: z.string().max(30).optional(),
  })
  .strict();

export const menuItemSchema = z.object({
  name: z.string().min(1).max(200),
  nameKN: z.string().optional().default(""),
  nameHI: z.string().optional().default(""),
  description: z.string().max(1000).optional().default(""),
  descriptionKN: z.string().optional().default(""),
  descriptionHI: z.string().optional().default(""),
  price: z.number().nonnegative().max(1000000),
  pricingType: z.string().optional().default("per_piece"),
  pricingLabel: z.string().optional().default(""),
  pricingLabelKN: z.string().optional().default(""),
  pricingLabelHI: z.string().optional().default(""),
  category: z.string().max(100).optional().default(""),
  categoryKN: z.string().optional().default(""),
  categoryHI: z.string().optional().default(""),
  image: z.string().max(5000).optional().default(""),
  featured: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(true),
  hasFlavors: z.boolean().optional().default(false),
  flavors: z
    .array(z.object({ name: z.string().min(1).max(100), price: z.number().nonnegative().max(1000000) }))
    .optional()
    .default([]),
});

export const galleryItemSchema = z.object({
  image: z.string().min(1).max(5000),
  caption: z.string().max(200).optional().default(""),
  eventType: z.string().max(100).optional().default(""),
  eventDate: z.string().max(20).optional().default(""),
  venue: z.string().max(200).optional().default(""),
});

export const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  photo: z.string().max(5000).optional().default(""),
  eventType: z.string().max(100).optional().default(""),
});

export const settingsSchema = z.object({
  businessName: z.string().max(200).optional(),
  tagline: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  instagram: z.string().max(100).optional(),
  aboutUs: z.string().max(5000).optional(),
  aboutUsKN: z.string().max(5000).optional(),
  aboutUsHI: z.string().max(5000).optional(),
  address: z.string().max(300).optional(),
  freeRadius: z.number().nonnegative().max(1000).optional(),
  travelChargePerKm: z.number().nonnegative().max(10000).optional(),
  heroTitle: z.string().max(200).optional(),
  heroSubtitle: z.string().max(200).optional(),
  heroDesc: z.string().max(5000).optional(),
  heroDescKN: z.string().max(5000).optional(),
  heroDescHI: z.string().max(5000).optional(),
  gstin: z.string().max(50).optional(),
  fssai: z.string().max(50).optional(),
  registeredAddress: z.string().max(500).optional(),
  bankName: z.string().max(200).optional(),
  accountNumber: z.string().max(50).optional(),
  ifsc: z.string().max(20).optional(),
  upiId: z.string().max(200).optional(),
  currency: z.string().max(10).optional(),
});
