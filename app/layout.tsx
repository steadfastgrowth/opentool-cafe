import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/chrome";
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
  description: "Take a tool you can actually run.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = await getSessionUser();
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <Chrome signedIn={Boolean(me)} slug={me?.slug || null} />
        {children}
      </body>
    </html>
  );
}
