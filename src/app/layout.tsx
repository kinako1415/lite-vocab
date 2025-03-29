import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Zen_Kaku_Gothic_New } from "next/font/google";

import "./globals.css";
import LoginListener from "@/hooks/LoginListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${zenKakuGothic.variable} antialiased`}
      >
        <LoginListener />
        {children}
      </body>
    </html>
  );
}
