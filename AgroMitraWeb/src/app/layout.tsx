import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FarmProvider } from "@/lib/farmStore";
import I18nProvider from "@/components/I18nProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Farm Care",
  description: "Smart farming solutions powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      >
        <LanguageProvider>
          <I18nProvider>
            <FarmProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
            </FarmProvider>
          </I18nProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
