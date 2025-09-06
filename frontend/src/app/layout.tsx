"use client";


import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { useUIStore } from "@/stores/uiStore";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useUIStore();

  return (
    <html lang="en" className={theme}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
