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
const GOLD_DIM = [179, 139, 45];
const BEIGE = [249, 245, 236];
const BEIGE_SOFT = [253, 251, 247];
const CHARCOAL = [43, 45, 66];
const WHITE = [255, 255, 255];
const BORDER = [224, 216, 203];
const MUTED = [140, 140, 140];

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
  note?: string;
  items: LineItem[];
  subtotal: number;
  travelCharge: number;
  total?: number;
  invoiceNo?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function money(n: number): string {
  return `Rs. ${Number(n).toFixed(2)}`;
}

const orNA = (v: unknown): string => (v === null || v === undefined || String(v).trim() === "" ? "N/A" : String(v));

export default function PDFDownload({ order, invoiceImageUrl }: { order?: OrderData; invoiceImageUrl?: string }) {
  const [businessName, setBusinessName] = useState("PRINCE EVENTS");
  const [tagline, setTagline] = useState("We Serve You Smile");
  const [phone, setPhone] = useState("+91 8618648069");
  const [instagram, setInstagram] = useState("prince_events_001");
  const [gstin, setGstin] = useState("");
  const [fssai, setFssai] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d) {
        if (d.businessName) setBusinessName(d.businessName);
        if (d.tagline) setTagline(d.tagline);
        if (d.phone) setPhone(d.phone);
        if (d.instagram) setInstagram(d.instagram);
        if (d.gstin) setGstin(d.gstin);
        if (d.fssai) setFssai(d.fssai);
        if (d.registeredAddress) setRegisteredAddress(d.registeredAddress);
        if (d.bankName) setBankName(d.bankName);
        if (d.accountNumber) setAccountNumber(d.accountNumber);
        if (d.ifsc) setIfsc(d.ifsc);
        if (d.upiId) setUpiId(d.upiId);
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

    // ── Header (white band, maroon/gold accents) ──
    const logoData = await new Promise<string>((resolve) => {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 28;
        canvas.height = 28;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0, 28, 28);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
        resolve("");
      };
      logoImg.onerror = () => resolve("");
      logoImg.src = "/favicon.svg";
    });

    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(businessName.toUpperCase(), m, 24);

    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
    doc.text(tagline, m, 31);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`Phone: ${phone}`, m, 37);

    // PE badge (gold circle + maroon monogram, right side)
    const cx = 176, cy = 24, r = 14;
    doc.setFillColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(1.2);
    doc.circle(cx, cy, r, "FD");
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", cx - 8, cy - 8, 16, 16);
      } catch {
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.text("PE", cx, cy + 1, { align: "center" });
      }
    } else {
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.text("PE", cx, cy + 1, { align: "center" });
    }

    // "TAX INVOICE" right-aligned under the badge
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text("TAX INVOICE", 190, 44, { align: "right" });

    // Maroon border under header
    doc.setDrawColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.setLineWidth(1.1);
    doc.line(m, 50, pw - m, 50);

    // ── Meta Boxes (Invoice Information | Customer Details) ──
    const boxY = 58;
    const boxW = (pw - 2 * m - 10) / 2;
    const box1X = m;
    const box2X = m + boxW + 10;

    const invoiceFields: [string, string][] = [
      ["Invoice No:", orNA(data.invoiceNo)],
      ["Invoice Date:", formatDate(new Date())],
      ["Event Date:", orNA(data.date)],
    ];
    if (gstin) invoiceFields.push(["GSTIN:", orNA(gstin)]);
    if (fssai) invoiceFields.push(["FSSAI:", orNA(fssai)]);

    const customerFields: [string, string][] = [
      ["Customer Name:", orNA(data.customerName)],
      ["Phone:", orNA(data.phone)],
      ["Venue:", orNA(data.venue)],
      ["Time:", orNA(data.time)],
    ];
    if (data.mealType && String(data.mealType).trim() !== "") {
      customerFields.push(["Meal Type:", orNA(data.mealType)]);
    }

    const boxH = Math.max(invoiceFields.length, customerFields.length) * 5.6 + 18;

    const drawMetaBox = (x: number, title: string, fields: [string, string][]) => {
      doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, boxY, boxW, boxH, 2, 2, "FD");
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.rect(x, boxY, 2.5, boxH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
      doc.text(title.toUpperCase(), x + 8, boxY + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const maxLabelW = Math.max(...fields.map(([label]) => doc.getTextWidth(label)));
      const valueX = x + 8 + maxLabelW + 5;
      let fy = boxY + 14.5;
      for (const [label, value] of fields) {
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(label, x + 8, fy);
        doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
        doc.text(value, valueX, fy);
        fy += 5.6;
      }
    };

    drawMetaBox(box1X, "Invoice Information", invoiceFields);
    drawMetaBox(box2X, "Customer Details", customerFields);

    // ── Line Items Table (autoTable) ──
    autoTable(doc, {
      startY: boxY + boxH + 8,
      head: [["Item Description", "Qty", "Unit", "Rate", "Amount"]],
      body: data.items.map((item) => [
        orNA(item.name),
        item.qty,
        orNA(item.pricingLabel),
        money(item.price),
        money(item.qty * item.price),
      ]),
      margin: { left: m, right: m },
      tableWidth: pw - 2 * m,
      headStyles: {
        fillColor: [MAROON[0], MAROON[1], MAROON[2]],
        textColor: [WHITE[0], WHITE[1], WHITE[2]],
        font: "times",
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [WHITE[0], WHITE[1], WHITE[2]],
        textColor: [CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]],
        font: "helvetica",
        fontSize: 9.5,
      },
      alternateRowStyles: {
        fillColor: [BEIGE_SOFT[0], BEIGE_SOFT[1], BEIGE_SOFT[2]],
      },
      columnStyles: {
        0: { cellWidth: 52, halign: "left", cellPadding: { left: 4 } },
        1: { cellWidth: 14, halign: "center" },
        2: { cellWidth: 26, halign: "center" },
        3: { cellWidth: 38, halign: "right", cellPadding: { right: 4 } },
        4: { cellWidth: 40, halign: "right", cellPadding: { right: 4 } },
      },
      styles: {
        lineColor: [BORDER[0], BORDER[1], BORDER[2]],
        lineWidth: 0.1,
        cellPadding: 2,
      },
      theme: "grid",
    });

    // ── Totals Section ──
    let ty = (doc as any).lastAutoTable.finalY + 10;
    const tl = 128, tv = 190;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text("Subtotal:", tl, ty);
    doc.text(money(subtotal), tv, ty, { align: "right" });
    ty += 7;

    doc.text("Travel Charge:", tl, ty);
    doc.text(money(travelCharge), tv, ty, { align: "right" });
    ty += 5;

    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.8);
    doc.line(tl, ty, tv, ty);
    ty += 8;

    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text("TOTAL AMOUNT:", tl, ty);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(money(grandTotal), tv, ty, { align: "right" });

    // ── Bank Details Block ──
    if (bankName || accountNumber || ifsc || upiId) {
      ty += 3;
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.setLineWidth(0.3);
      doc.line(m, ty - 2, 190, ty - 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
      doc.text("BANK DETAILS", m, ty);
      ty += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      const bankParts: string[] = [];
      if (bankName) bankParts.push(`Bank: ${bankName}`);
      if (accountNumber) bankParts.push(`A/c: ${accountNumber}`);
      if (ifsc) bankParts.push(`IFSC: ${ifsc}`);
      if (upiId) bankParts.push(`UPI: ${upiId}`);
      doc.text(bankParts.join("  |  "), m, ty);
      ty += 5;
    }

    // ── Signatory Block ──
    ty += 6;
    const sigRight = 190, sigLeft = 150;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.4);
    doc.line(sigLeft, ty, sigRight, ty);
    ty += 4;
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text(`For ${businessName}`, sigRight, ty, { align: "right" });
    ty += 5;
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.text("Authorised Signatory", sigRight, ty, { align: "right" });

    // ── Footer ──
    let fy = Math.max(ph - 32, ty + 12);
    if (fy > ph - 22) fy = ph - 32;
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.3);
    doc.line(m, fy, pw - m, fy);
    fy += 7;

    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
    doc.text(`Thank you for choosing ${businessName}!`, pw / 2, fy, { align: "center" });
    fy += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`@${instagram}     |     This is a computer-generated invoice.`, pw / 2, fy, { align: "center" });

    if (registeredAddress) {
      fy += 4;
      doc.text(registeredAddress, pw / 2, fy, { align: "center" });
    }

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

        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
        doc.text("UPLOADED INVOICE IMAGE", pw / 2, 20, { align: "center" });

        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.5);
        doc.line(m, 25, pw - m, 25);

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

    const blob = doc.output('bloburl');
    window.open(blob, '_blank');
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
