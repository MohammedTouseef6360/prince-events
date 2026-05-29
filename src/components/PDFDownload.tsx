"use client";

import { useState, useEffect } from "react";
import { HiDocumentDownload } from "react-icons/hi";

const MOCK_ITEMS = [
  { name: "Camb Name 1", qty: 1, rate: 200, unit: "piece" },
  { name: "Camb Name 2", qty: 1, rate: 250, unit: "piece" },
  { name: "Camb Name 3", qty: 1, rate: 100, unit: "piece" },
  { name: "Camb Name 4", qty: 1, rate: 50, unit: "piece" },
  { name: "Camb Name 5", qty: 1, rate: 50, unit: "piece" },
  { name: "Camb Rocn", qty: 1, rate: 10, unit: "time" },
  { name: "Borry Pasta", qty: 1, rate: 10, unit: "plate" },
];

const MAROON = [128, 0, 32];
const GOLD = [212, 175, 55];
const BEIGE = [249, 245, 236];
const CHARCOAL = [43, 45, 66];
const WHITE = [255, 255, 255];

interface LineItem {
  name: string;
  qty: number;
  price: number;
  pricingLabel: string;
}

interface OrderData {
  customerName: string;
  phone: string;
  date: string;
  venue: string;
  time: string;
  mealType?: string;
  items: LineItem[];
  subtotal: number;
  travelCharge: number;
  total?: number;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PDFDownload({ order, invoiceImageUrl }: { order?: OrderData; invoiceImageUrl?: string }) {
  const [businessName, setBusinessName] = useState("PRINCE EVENT'S");
  const [tagline, setTagline] = useState("We Serve You Smile");
  const [phone, setPhone] = useState("+91 8618648069");
  const [instagram, setInstagram] = useState("prince_events_001");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d) {
        if (d.businessName) setBusinessName(d.businessName);
        if (d.tagline) setTagline(d.tagline);
        if (d.phone) setPhone(d.phone);
        if (d.instagram) setInstagram(d.instagram);
      }
    }).catch(() => {});
  }, []);
  const data = order || {
    customerName: "Demo Customer",
    phone: "+91 9876543210",
    date: "20 Nov 2023",
    venue: "Grand Palace, Bengaluru",
    time: "05:00 - 09:00 PM",
    mealType: "Dinner",
    items: MOCK_ITEMS.map((m) => ({ name: m.name, qty: m.qty, price: m.rate, pricingLabel: m.unit })),
    subtotal: MOCK_ITEMS.reduce((s, i) => s + i.qty * i.rate, 0),
    travelCharge: 0,
  };

  const subtotal = data.subtotal;
  const travelCharge = data.travelCharge;
  const grandTotal = data.total ?? subtotal + travelCharge;

  const generatePDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 20;

    // ── Header Band (Y=0 to Y=45) ──
    doc.setFillColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.rect(0, 0, pw, 45, "F");

    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text(businessName, m, 25);

    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.text(tagline, m, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.text(`${phone}`, 190, 38, { align: "right" });

    // Monogram "PE" in gold circle
    const cx = 170, cy = 18, r = 14;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(1);
    doc.circle(cx, cy, r, "S");
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text("PE", cx, cy + 1, { align: "center" });

    // Gold underline at Y=45
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(1);
    doc.line(0, 45, pw, 45);

    // ── Background Fill Y=46 to Y=285 ──
    doc.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
    doc.rect(0, 46, pw, 240, "F");

    // ── Invoice Metadata (Y=60) ──
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text("TAX INVOICE", m, 62);

    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.5);
    doc.line(m, 67, 190, 67);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(`Invoice No: PE-${Date.now().toString().slice(-8)}`, m, 76);
    doc.text(`Invoice Date: ${formatDate(new Date())}`, m + 90, 76);
    doc.text(`Event Date: ${data.date}`, m, 82);

    // Status stamp
    const stampX = 150;
    doc.setDrawColor(42, 157, 143);
    doc.setLineWidth(0.8);
    doc.rect(stampX, 68, 45, 14, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(42, 157, 143);
    doc.text("PAID ON DELIVERY", stampX + 22.5, 78, { align: "center" });

    // ── Customer Details Box (Y=90 to Y=115) ──
    doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setDrawColor(200, 180, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(m, 90, pw - 2 * m, 25, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text("CUSTOMER DETAILS", m + 5, 97);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const col1X = m + 5;
    const col2X = m + 100;
    doc.text(`Customer Name: ${data.customerName}`, col1X, 107);
    doc.text(`Phone: ${data.phone}`, col1X, 113);
    doc.text(`Venue: ${data.venue}`, col2X, 107);
    doc.text(`Time: ${data.time}`, col2X, 113);
    if (data.mealType) {
      doc.text(`Meal Type: ${data.mealType}`, col2X, 119);
    }

    // ── Line Items Table (autoTable) ──
    autoTable(doc, {
      startY: 128,
      head: [["Item", "Qty", "Rate", "Amount"]],
      body: data.items.map((item) => [
        item.name,
        item.qty,
        `\u20B9${item.price} per ${item.pricingLabel}`,
        `\u20B9${(item.qty * item.price).toFixed(2)}`,
      ]),
      margin: { left: m, right: m },
      tableWidth: pw - 2 * m,
      columns: [
        { header: "Item", dataKey: "0" },
        { header: "Qty", dataKey: "1" },
        { header: "Rate", dataKey: "2" },
        { header: "Amount", dataKey: "3" },
      ],
      headStyles: {
        fillColor: [MAROON[0], MAROON[1], MAROON[2]] as [number, number, number],
        textColor: [WHITE[0], WHITE[1], WHITE[2]] as [number, number, number],
        font: "times",
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [WHITE[0], WHITE[1], WHITE[2]] as [number, number, number],
        textColor: [CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]] as [number, number, number],
        font: "helvetica",
        fontSize: 9.5,
      },
      alternateRowStyles: {
        fillColor: [253, 251, 247] as [number, number, number],
      },
      columnStyles: {
        0: { cellWidth: 80, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 45, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
      styles: {
        lineColor: [220, 210, 195],
        lineWidth: 0.1,
      },
      theme: "grid",
    });

    // ── Totals Section ──
    let ty = (doc as any).lastAutoTable.finalY + 10;
    const tl = 130, tv = 190; // label x, value x

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text("Subtotal:", tl, ty);
    doc.text(`\u20B9${subtotal.toFixed(2)}`, tv, ty, { align: "right" });
    ty += 7;

    doc.text("Travel Charge:", tl, ty);
    doc.text(`\u20B9${travelCharge.toFixed(2)}`, tv, ty, { align: "right" });
    ty += 5;

    // Gold divider
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(1);
    doc.line(tl, ty, tv, ty);
    ty += 8;

    // Grand Total
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text("TOTAL AMOUNT:", tl, ty);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`\u20B9${grandTotal.toFixed(2)}`, tv, ty, { align: "right" });

    // ── Footer (Y=265+) ──
    let fy = 260;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line(m, fy, 190, fy);
    fy += 8;

    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text(`Thank you for choosing ${businessName}!`, pw / 2, fy, { align: "center" });
    fy += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Contact query: If you have any questions regarding this invoice, please reach out.", pw / 2, fy, { align: "center" });

    // Maroon footer band Y=285 to Y=297
    doc.setFillColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.rect(0, 285, pw, 12, "F");
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`@${instagram}     |     This is a computer-generated invoice.`, pw / 2, ph - 7, { align: "center" });

    // ── Uploaded Invoice Image as Second Page ──
    if (invoiceImageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const imgData = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Failed to get canvas context")); return; }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
          };
          img.onerror = () => reject(new Error("Failed to load invoice image"));
          img.src = invoiceImageUrl;
        });

        doc.addPage();
        doc.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
        doc.rect(0, 0, pw, ph, "F");

        // Add label at top
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
        doc.text("UPLOADED INVOICE IMAGE", pw / 2, 20, { align: "center" });

        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.5);
        doc.line(m, 25, pw - m, 25);

        // Calculate image dimensions to fit page
        const imgProps = doc.getImageProperties(imgData);
        const maxW = pw - 2 * m;
        const maxH = ph - 40;
        const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height, 1);
        const imgW = imgProps.width * ratio;
        const imgH = imgProps.height * ratio;
        const imgX = (pw - imgW) / 2;
        const imgY = (ph - imgH) / 2 + 10;

        doc.addImage(imgData, "JPEG", imgX, imgY, imgW, imgH);
      } catch {
        // Silently skip image embedding if it fails
      }
    }

    doc.save(`PRINCE-EVENTS-Invoice-${Date.now().toString().slice(-8)}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="royal-btn-gold flex items-center gap-2 text-sm"
    >
      <HiDocumentDownload size={16} />
      Download Invoice
    </button>
  );
}
