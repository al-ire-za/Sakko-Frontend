import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const nazaninFont = localFont({
  src: "../public/fonts/B-NAZANIN.ttf",
  variable: "--font-nazanin",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سکو | پلتفرم هوشمند برنامه‌ریزی و مشاوره تحصیلی",
  description: "سامانه هوشمند برنامه‌ریزی درسی، ثبت ساعت مطالعه، درصدگیری و ارتباط آنلاین با مشاورین تحصیلی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${nazaninFont.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
