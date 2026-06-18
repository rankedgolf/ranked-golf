import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/app/components/Footer";
import "leaflet/dist/leaflet.css";
import { Analytics } from "@vercel/analytics/react";
import Clarity from "@microsoft/clarity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ranked Golf World Rankings",
  description: "Competitive amateur golf rankings platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  if (process.env.NODE_ENV === "production") {
  Clarity.init("x8ygezypbb");
}

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />

        {children}

        <Footer />

        <Analytics />
      </body>
    </html>
  );
}
