import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  nameKN: string;
  nameHI: string;
  description: string;
  descriptionKN: string;
  descriptionHI: string;
  price: number;
  pricingType: "per_piece" | "per_plate" | "per_time";
  pricingLabel: string;
  pricingLabelKN: string;
  pricingLabelHI: string;
  category: string;
  categoryKN: string;
  categoryHI: string;
  image: string;
  featured: boolean;
  inStock: boolean;
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    nameKN: { type: String, default: "" },
    nameHI: { type: String, default: "" },
    description: { type: String, default: "" },
    descriptionKN: { type: String, default: "" },
    descriptionHI: { type: String, default: "" },
    price: { type: Number, required: true },
    pricingType: {
      type: String,
      enum: ["per_piece", "per_plate", "per_time"],
      default: "per_piece",
    },
    pricingLabel: { type: String, default: "Per Piece" },
    pricingLabelKN: { type: String, default: "ಪ್ರತಿ ತುಂಡಿಗೆ" },
    pricingLabelHI: { type: String, default: "प्रति टुकड़ा" },
    category: { type: String, default: "General" },
    categoryKN: { type: String, default: "ಸಾಮಾನ್ಯ" },
    categoryHI: { type: String, default: "सामान्य" },
    image: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IOrder extends Document {
  customerName: string;
  phone: string;
  date: string;
  venue: string;
  time: string;
  mealType?: string;
  items: {
    itemName: string;
    qty: number;
    price: number;
    pricingType: string;
  }[];
  travelCharge: number;
  subtotal: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered";
  invoiceImage?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    venue: { type: String, required: true },
    time: { type: String, required: true },
    mealType: { type: String, default: "" },
    items: [
      {
        itemName: String,
        qty: Number,
        price: Number,
        pricingType: String,
      },
    ],
    travelCharge: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered"],
      default: "pending",
    },
    invoiceImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export interface IGallery extends Document {
  image: string;
  caption: string;
  captionKN: string;
  captionHI: string;
  createdAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    captionKN: { type: String, default: "" },
    captionHI: { type: String, default: "" },
  },
  { timestamps: true }
);

export interface ITestimonial extends Document {
  name: string;
  message: string;
  messageKN: string;
  messageHI: string;
  rating: number;
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    message: { type: String, required: true },
    messageKN: { type: String, default: "" },
    messageHI: { type: String, default: "" },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export interface ISettings extends Document {
  businessName: string;
  tagline: string;
  phone: string;
  instagram: string;
  aboutUs: string;
  aboutUsKN: string;
  aboutUsHI: string;
  address: string;
  freeRadius: number;
  travelChargePerKm: number;
  adminPassword: string;
  currency: string;
}

const SettingsSchema = new Schema<ISettings>({
  businessName: { type: String, default: "PRINCE EVENTS" },
  tagline: { type: String, default: "We Serve You Smile" },
  phone: { type: String, default: "+91 8618648069" },
  instagram: { type: String, default: "prince_events_001" },
  aboutUs: { type: String, default: "" },
  aboutUsKN: { type: String, default: "" },
  aboutUsHI: { type: String, default: "" },
  address: { type: String, default: "Bengaluru, Karnataka" },
  freeRadius: { type: Number, default: 10 },
  travelChargePerKm: { type: Number, default: 10 },
  adminPassword: { type: String, default: "prince@123" },
  currency: { type: String, default: "₹" },
});

export const MenuItem =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export const Gallery =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
export const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
