import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = "https://princeevents.in";

export const metadata: Metadata = {
  title: {
    default: "PRINCE EVENT'S - We Serve You Smile",
    template: "%s | PRINCE EVENT'S",
  },
  description:
    "Royal wedding snacks and starters in Bengaluru, Karnataka. Wedding catering, snack stalls, and event food services by PRINCE EVENT'S.",
  keywords: ["wedding snacks", "catering Bengaluru", "wedding starters", "Prince Events", "event catering", "snack stall"],
  authors: [{ name: "PRINCE EVENT'S" }],
  openGraph: {
    title: "PRINCE EVENT'S - We Serve You Smile",
    description: "Royal wedding snacks and starters in Bengaluru, Karnataka.",
    url: siteUrl,
    siteName: "PRINCE EVENT'S",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRINCE EVENT'S - We Serve You Smile",
    description: "Royal wedding snacks and starters in Bengaluru, Karnataka.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#800020" />
        <meta name="application-name" content="PRINCE EVENT'S" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prince Events" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.svg" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", function() {
                  navigator.serviceWorker.register("/sw.js");
                });
              }
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
