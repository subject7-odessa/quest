import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-orbitron" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani" });

export const metadata: Metadata = {
  title: "QuestFit — Sistema de Status",
  description: "Evolução física real, num sistema de status estilo RPG.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${orbitron.variable} ${rajdhani.variable} font-body min-h-screen`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
