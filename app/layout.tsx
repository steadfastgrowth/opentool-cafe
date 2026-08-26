import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/chrome";
import { Footer } from "@/components/footer";
import { TrackPage } from "@/components/track-page";
import { getSessionUser } from "@/lib/auth";

const display = Chakra_Petch({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Open Tool Cafe",
  description: "Share and download open source tools. Connect with founders and builders.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Open Tool Cafe",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  metadataBase: new URL("https://opentool.cafe"),
  openGraph: {
    title: "Open Tool Cafe",
    description: "Welcome to open tool cafe, can I take your order?",
    url: "https://opentool.cafe",
    siteName: "Open Tool Cafe",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Open Tool Cafe" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Tool Cafe",
    description: "Welcome to open tool cafe, can I take your order?",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f4e6c8",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = await getSessionUser();
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <Chrome
          signedIn={Boolean(me)}
          slug={me?.slug || null}
          avatarUrl={me?.avatarUrl}
          name={me?.name}
        />
        <div id="content">{children}</div>
        <Footer />
        <Suspense fallback={null}>
          <TrackPage />
        </Suspense>
      </body>
    </html>
  );
}
