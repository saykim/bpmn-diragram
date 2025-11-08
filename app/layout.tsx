import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPMN Flow - 식품공장 프로세스 관리",
  description: "식품공장 HACCP 및 생산 프로세스 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
