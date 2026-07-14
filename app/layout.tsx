import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-score",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup 2026 Knockout Predictor",
  description: "Simulate the World Cup 2026 semi-finals and final between France, Spain, England and Argentina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="px-4 py-4 text-center text-[11px] leading-relaxed text-white/40">
          ⚠️ Disclaimer: This prediction is for entertainment only. It is not an official
          forecast, and no accuracy or outcome is guaranteed. We accept no responsibility or
          liability for any decisions based on these predictions.
        </footer>
      </body>
    </html>
  );
}
