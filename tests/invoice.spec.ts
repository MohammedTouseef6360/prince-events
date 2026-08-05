import { test, expect } from "@playwright/test";

const SEED_ITEMS = [
  { id: "seed1", key: "seed1", name: "Catering Item One", price: 200, qty: 2, pricingType: "per_piece", pricingLabel: "piece", image: "" },
  { id: "seed2", key: "seed2", name: "Catering Item Two", price: 85, qty: 5, pricingType: "per_piece", pricingLabel: "plate", image: "" },
];

test("invoice PDF renders and captures cleanly", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.addInitScript((items) => {
    localStorage.setItem("prince-events-cart", JSON.stringify(items));
    (window as any).__capturedBlobUrl = null;
    const origOpen = window.open.bind(window);
    (window as any).open = (url?: string, ...rest: any[]) => {
      if (url && url.startsWith("blob:")) (window as any).__capturedBlobUrl = url;
      return origOpen(url, ...rest);
    };
  }, SEED_ITEMS);

  await page.goto("/cart");
  await page.getByRole("button", { name: "Download Invoice" }).click();

  const blobUrl = await page.evaluate(async () => {
    const start = Date.now();
    while (Date.now() - start < 8000) {
      if ((window as any).__capturedBlobUrl) return (window as any).__capturedBlobUrl;
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  });
  console.log("CAPTURED_BLOB:", blobUrl);

  const result = await page.evaluate(async (url) => {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
    const latin = new TextDecoder("windows-1252").decode(buf);
    const strings: string[] = [];
    const tjRe = /\((?:[^()\\]|\\.)*\)\s*Tj/g;
    let mm;
    while ((mm = tjRe.exec(latin)) !== null) {
      const s = mm[0].replace(/^\(|\)\s*Tj$/g, "").replace(/\\([()\\])/g, "$1");
      if (s.trim().length >= 1) strings.push(s);
    }
    const TJre = /\[((?:\([^()\\]*\)\s*(?:-\d+\.?\d*)?\s*)*)\]\s*TJ/g;
    while ((mm = TJre.exec(latin)) !== null) {
      const joined = mm[1].replace(/\(([^()\\]*)\)/g, "$1").replace(/-?\d+\.?\d+/g, "");
      if (joined.trim().length >= 1) strings.push(joined);
    }
    return { header, size: bytes.length, text: strings };
  }, blobUrl);
  console.log("PDF_INFO:", JSON.stringify(result));

  expect(result.header).toContain("%PDF");
  const all = result.text.join("\n");
  expect(all).toContain("Rs.");
  expect(all).not.toContain("¹");
  expect(all).toContain("400.00");
  expect(all).toContain("200.00");
  expect(all).toContain("Catering Item One");
  await testInfo.attach("invoice-text", { body: all, contentType: "text/plain" });
});
