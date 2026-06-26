"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Ticket,
  CheckSquare,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function HomePage() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await authService.refresh();
        setAccessToken(refreshRes.accessToken);
        const meRes = await authService.getMe();
        setUser(meRes.data);
        setLoading(false);
      } catch (err) {
        console.log("Error:", err);
        router.push("/login");
      }
    };
    init();
  }, [router, setAccessToken, setUser]);

  if (loading)
    return (
      <>
        <style>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f1eb;
            gap: 16px;
          }

          .loading-logo {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #c8a882, #b8916a);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 4px;
            box-shadow: 0 4px 14px rgba(184,145,106,0.3);
          }

          .loading-spinner-wrap {
            position: relative;
            width: 36px;
            height: 36px;
          }

          .loading-spinner-track {
            position: absolute;
            inset: 0;
            border: 3px solid #e8e0d5;
            border-radius: 50%;
          }

          .loading-spinner {
            position: absolute;
            inset: 0;
            border: 3px solid transparent;
            border-top-color: #b8916a;
            border-radius: 50%;
            animation: spin-smooth 0.85s linear infinite;
          }

          @keyframes spin-smooth {
            to { transform: rotate(360deg); }
          }

          .loading-text {
            font-size: 13px;
            font-weight: 500;
            color: #c0a888;
            animation: pulse-warm 2s ease-in-out infinite;
          }

          @keyframes pulse-warm {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.45; }
          }
        `}</style>
        <div className="loading-screen">
          <div className="loading-logo">B</div>
          <div className="loading-spinner-wrap">
            <div className="loading-spinner-track" />
            <div className="loading-spinner" />
          </div>
          <p className="loading-text">Đang tải dữ liệu hệ thống...</p>
        </div>
      </>
    );

  if (!user) return null;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "ORGANIZER") return <OrganizerDashboard />;
  return null;
}

/* ── Admin Dashboard ── */
function AdminDashboard() {
  const cards = [
    {
      label: "Người dùng",
      count: "1,248",
      growth: "+12%",
      growthUp: true,
      icon: Users,
      iconBg: "#e8f0fa",
      iconColor: "#4a7cc9",
      href: "/admin/users",
    },
    {
      label: "Sự kiện",
      count: "84",
      growth: "+5%",
      growthUp: true,
      icon: Calendar,
      iconBg: "#e8f5ef",
      iconColor: "#3a9e70",
      href: "/admin/events",
    },
    {
      label: "Đặt vé",
      count: "3,420",
      growth: "+18%",
      growthUp: true,
      icon: Ticket,
      iconBg: "#f0e8fa",
      iconColor: "#8a5cc9",
      href: "/admin/bookings",
    },
    {
      label: "Yêu cầu duyệt",
      count: "7",
      growth: "Cần xử lý",
      growthUp: false,
      icon: CheckSquare,
      iconBg: "#faf0e0",
      iconColor: "#c9883a",
      href: "/admin/applications",
    },
  ];

  return (
    <DashboardLayout title="Tổng quan hệ thống">
      <style>{`
        .dash-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .dash-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .dash-grid-4 { grid-template-columns: 1fr; }
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 20px;
          text-decoration: none;
          display: block;
          transition: all 0.2s ease;
          animation: fade-in-up 0.35s ease both;
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(200,168,130,0.03), transparent 60%);
          pointer-events: none;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(139,94,60,0.10);
          border-color: #ddd0be;
        }

        .stat-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.08) rotate(-3deg);
        }

        .stat-badge-up {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 99px;
          background: #e8f5ef;
          color: #2e7d5a;
        }

        .stat-badge-pending {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 99px;
          background: #faf0e0;
          color: #a0692a;
        }

        .stat-count {
          font-size: 26px;
          font-weight: 800;
          color: #3d2f1f;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 5px;
          transition: color 0.2s;
        }

        .stat-card:hover .stat-count {
          color: #8b5e3c;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 500;
          color: #a89070;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-arrow {
          opacity: 0;
          transform: translate(0, 0);
          transition: all 0.2s ease;
        }

        .stat-card:hover .stat-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
        }
      `}</style>

      <div className="dash-grid-4 stagger-children">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="stat-card">
            <div className="stat-card-top">
              <div
                className="stat-icon"
                style={{ background: card.iconBg }}
              >
                <card.icon size={20} color={card.iconColor} />
              </div>
              <span className={card.growthUp ? "stat-badge-up" : "stat-badge-pending"}>
                {card.growth}
              </span>
            </div>
            <div className="stat-count">{card.count}</div>
            <div className="stat-label">
              {card.label}
              <ArrowUpRight size={13} className="stat-arrow" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

/* ── Organizer Dashboard ── */
function OrganizerDashboard() {
  const cards = [
    {
      label: "Sự kiện hoạt động",
      count: "12",
      detail: "3 sự kiện tuần này",
      icon: Calendar,
      iconBg: "#e8f5ef",
      iconColor: "#3a9e70",
      href: "/organizer/events",
    },
    {
      label: "Doanh thu tháng này",
      count: "45.8M",
      detail: "+24% so với tháng trước",
      icon: TrendingUp,
      iconBg: "#e8f0fa",
      iconColor: "#4a7cc9",
      href: "/organizer/revenue",
    },
    {
      label: "Tỷ lệ lấp đầy vé",
      count: "87.5%",
      detail: "Tổng số 1,450 vé bán ra",
      icon: BarChart3,
      iconBg: "#f0e8fa",
      iconColor: "#8a5cc9",
      href: "/organizer/revenue",
    },
  ];

  return (
    <DashboardLayout title="Tổng quan Ban tổ chức">
      <style>{`
        .dash-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .dash-grid-3 { grid-template-columns: 1fr; }
        }

        .org-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 22px;
          text-decoration: none;
          display: block;
          transition: all 0.2s ease;
          animation: fade-in-up 0.35s ease both;
          position: relative;
          overflow: hidden;
        }

        .org-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(200,168,130,0.03), transparent 60%);
          pointer-events: none;
        }

        .org-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(139,94,60,0.10);
          border-color: #ddd0be;
        }

        .org-card-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .org-card-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .org-card-label {
          font-size: 13px;
          font-weight: 500;
          color: #a89070;
        }

        .org-card-count {
          font-size: 30px;
          font-weight: 800;
          color: #3d2f1f;
          letter-spacing: -0.02em;
          line-height: 1;
          transition: color 0.2s;
        }

        .org-card:hover .org-card-count {
          color: #8b5e3c;
        }

        .org-card-detail {
          font-size: 12px;
          color: #c0a888;
          font-weight: 500;
        }

        .org-icon {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .org-card:hover .org-icon {
          transform: scale(1.1) rotate(-4deg);
        }
      `}</style>

      <div className="dash-grid-3 stagger-children">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="org-card">
            <div className="org-card-inner">
              <div className="org-card-body">
                <div className="org-card-label">{card.label}</div>
                <div className="org-card-count">{card.count}</div>
                <div className="org-card-detail">{card.detail}</div>
              </div>
              <div
                className="org-icon"
                style={{ background: card.iconBg }}
              >
                <card.icon size={22} color={card.iconColor} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}