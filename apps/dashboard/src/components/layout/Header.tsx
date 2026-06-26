"use client";

import { useAuthStore } from "@/stores/auth.store";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <>
      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 40;
          height: 60px;
          width: 100%;
          background: rgba(250, 248, 245, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8e0d5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          transition: box-shadow 0.2s ease;
        }

        .header:hover {
          box-shadow: 0 1px 12px rgba(139,94,60,0.06);
        }

        .header-title {
          font-size: 17px;
          font-weight: 700;
          color: #3d2f1f;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .header-breadcrumb {
          font-size: 12px;
          color: #c0a888;
          margin: 0;
          margin-top: 1px;
          font-weight: 400;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-bell-btn {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 10px;
          color: #a89070;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .header-bell-btn:hover {
          background: #f5f1eb;
          color: #8b5e3c;
          border-color: #d4c4b0;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(139,94,60,0.1);
        }

        .header-bell-btn:hover svg {
          animation: bell-ring 0.4s ease;
        }

        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          60% { transform: rotate(12deg); }
          80% { transform: rotate(-6deg); }
        }

        .header-bell-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 7px;
          height: 7px;
          background: #e07070;
          border-radius: 50%;
          border: 1.5px solid #faf8f5;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.85); }
        }

        .header-divider {
          width: 1px;
          height: 22px;
          background: #e0d8cc;
          margin: 0 4px;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 12px 6px 7px;
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 24px;
          cursor: default;
          transition: all 0.18s ease;
        }

        .header-user:hover {
          border-color: #d4c4b0;
          box-shadow: 0 2px 8px rgba(139,94,60,0.08);
        }

        .header-user-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .header-user-greeting {
          font-size: 12.5px;
          color: #a89070;
        }

        .header-user-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #3d2f1f;
        }
      `}</style>

      <header className="header">
        {/* Tiêu đề trang */}
        <div>
          <h1 className="header-title">{title}</h1>
        </div>

        {/* Khu vực Action & Profile */}
        <div className="header-actions">
          {/* Nút thông báo */}
          <button className="header-bell-btn" aria-label="Thông báo">
            <Bell size={17} />
            <span className="header-bell-dot" />
          </button>

          <div className="header-divider" />

          {/* Thông tin User */}
          <div className="header-user">
            <div className="header-user-avatar">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <span className="header-user-greeting">Xin chào, </span>
              <span className="header-user-name">{user?.fullName}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
