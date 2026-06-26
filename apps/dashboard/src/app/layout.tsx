import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BianEvent Dashboard",
  description: "Quản lý sự kiện và vé BianEvent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#faf8f5",
              color: "#3d2f1f",
              borderRadius: "12px",
              fontSize: "13.5px",
              fontWeight: "500",
              padding: "12px 16px",
              border: "1px solid #e8e0d5",
              boxShadow:
                "0 8px 24px rgba(139,94,60,0.10), 0 2px 6px rgba(139,94,60,0.06)",
            },
            success: {
              iconTheme: { primary: "#7ab87a", secondary: "#faf8f5" },
            },
            error: {
              iconTheme: { primary: "#d07070", secondary: "#faf8f5" },
            },
          }}
        />
      </body>
    </html>
  );
}
