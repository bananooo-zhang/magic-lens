import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 魔法修图 | 你的智能修图师",
  description: "基于 Gemini 3.0 的对话式 AI 修图工具，专为女性设计。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={cn(inter.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
