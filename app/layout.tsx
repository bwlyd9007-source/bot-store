import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BOT STORE | متجرك الأول لعالم الديسكورد",
  description:
    "متجر بوتات ديسكورد: بوتات جاهزة للحماية والإدارة والترفيه، برمجة بوتات مخصصة، تصميم سيرفرات، واستضافة 24/7.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-night text-white font-sans">
        {children}
      </body>
    </html>
  );
}
