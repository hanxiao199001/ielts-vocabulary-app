import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "雅思单词学习 - IELTS Vocabulary",
  description: "一个帮助学习雅思2200核心词汇的网页工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body
        className="font-sans antialiased h-full bg-gray-50 dark:bg-gray-900"
      >
        <div className="flex flex-col h-full pb-16">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
