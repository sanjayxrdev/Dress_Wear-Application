import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StyleTry AI — Live AR Fitting Room for E-Commerce",
    template: "%s | StyleTry AI",
  },
  description:
    "Embeddable live AR and virtual try-on engine for e-commerce brands. Zero video retention, real-time pose tracking, and explainable style intelligence.",
  openGraph: {
    title: "StyleTry AI — Live AR Fitting Room for E-Commerce",
    description:
      "Embeddable live AR and virtual try-on engine for e-commerce brands. Zero video retention, real-time pose tracking, and explainable style intelligence.",
    type: "website",
    locale: "en_US",
    siteName: "StyleTry AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleTry AI — Live AR Fitting Room for E-Commerce",
    description:
      "Embeddable live AR and virtual try-on engine for e-commerce brands.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fcfbf8] text-[#141413]">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
