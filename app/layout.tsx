import type { Metadata } from "next";
import { Geist_Mono, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const headingFont = Shippori_Mincho({
  variable: "--font-japanese-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Zen_Kaku_Gothic_New({
  variable: "--font-japanese-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const monoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sakura-ya · Sushi y ramen",
  description: "Sistema de gestión de pedidos e inventario del restaurante japonés Sakura-ya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", headingFont.variable, bodyFont.variable, monoFont.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
