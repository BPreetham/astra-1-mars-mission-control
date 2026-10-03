import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ASTRA-1 — Mars Mission Control",
  description: "Mission Control Dashboard for Astra-1 Mars Colony Emergency Crisis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050811] text-slate-100 flex min-h-screen overflow-x-hidden antialiased font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[#070c18]">
          {children}
        </main>
      </body>
    </html>
  );
}
