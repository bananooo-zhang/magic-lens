import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

// Remove Google Fonts dependency to avoid build timeouts
// const inter = Inter({ subsets: ["latin"] });

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
      {/* Use system fonts instead of Inter */}
      <body className={cn("font-sans antialiased", "bg-background text-foreground")}>
        {children}
      </body>
    </html>
  );
}
