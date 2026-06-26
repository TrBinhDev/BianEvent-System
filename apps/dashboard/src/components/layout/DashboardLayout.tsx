"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  return (
    <>
      <style>{`
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: #f5f1eb;
          color: #3d2f1f;
          -webkit-font-smoothing: antialiased;
        }

        .dashboard-root ::selection {
          background: rgba(200,168,130,0.35);
          color: #3d2f1f;
        }

        .dashboard-content {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .dashboard-main {
          flex: 1;
          padding: 28px 32px;
          animation: fade-in-up 0.35s ease both;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .dashboard-main {
            padding: 20px;
          }
        }
      `}</style>

      <div className="dashboard-root">
        <Sidebar />

        <div className="dashboard-content">
          <Header title={title} />
          <main className="dashboard-main">
            <div className="dashboard-inner">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
