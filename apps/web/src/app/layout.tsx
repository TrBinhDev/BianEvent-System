import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BianEvent — Nền tảng mua bán vé sự kiện",
  description:
    "Khám phá và đặt vé những đêm nhạc, vở diễn, hội nghị và lễ hội đang chờ bạn trên khắp Việt Nam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            },
            success: {
              iconTheme: { primary: "#8B1A1A", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
