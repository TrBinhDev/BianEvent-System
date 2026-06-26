/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { OrganizerApplication } from "@/types/admin.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ duyệt", color: "app-badge-pending" },
  APPROVED: { label: "Đã duyệt", color: "app-badge-approved" },
  REJECTED: { label: "Từ chối", color: "app-badge-rejected" },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await adminService.getApplications({
          page,
          limit: 10,
          status: statusFilter || undefined,
        });
        setApplications(res.data);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [page, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveApplication(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)),
      );
      toast.success("Đã duyệt đơn Organizer");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối đơn này?")) return;
    try {
      await adminService.rejectApplication(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)),
      );
      toast.success("Đã từ chối đơn");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  // Stats
  const pendingCount = applications.filter(
    (a) => a.status === "PENDING",
  ).length;
  const approvedCount = applications.filter(
    (a) => a.status === "APPROVED",
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "REJECTED",
  ).length;

  return (
    <>
      <style>{`
        /* ── Container ── */
        .app-container {
          width: 100%;
        }

        /* ── Stats cards ── */
        .app-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .app-stat-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 12px;
          padding: 14px 18px;
          animation: fade-in-up 0.35s ease both;
        }

        .app-stat-card:nth-child(1) { animation-delay: 0.03s; }
        .app-stat-card:nth-child(2) { animation-delay: 0.06s; }
        .app-stat-card:nth-child(3) { animation-delay: 0.09s; }

        .app-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .app-stat-label svg {
          width: 14px;
          height: 14px;
        }

        .app-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #3d2f1f;
          margin-top: 4px;
        }

        /* ── Filter buttons ── */
        .app-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .app-filter-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .app-filter-btn:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .app-filter-btn.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 2px 8px rgba(184,145,106,0.25);
        }

        /* ── Application card ── */
        .app-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 12px;
          animation: fade-in-up 0.35s ease both;
          transition: all 0.18s;
        }

        .app-card:hover {
          border-color: #d5c8b8;
        }

        .app-card:last-child {
          margin-bottom: 0;
        }

        .app-card:nth-child(1) { animation-delay: 0.12s; }
        .app-card:nth-child(2) { animation-delay: 0.16s; }
        .app-card:nth-child(3) { animation-delay: 0.20s; }
        .app-card:nth-child(4) { animation-delay: 0.24s; }
        .app-card:nth-child(5) { animation-delay: 0.28s; }

        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .app-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .app-card-left {
          flex: 1;
          min-width: 0;
        }

        .app-card-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .app-org-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #faf8f5, #f0ebe3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0a888;
          flex-shrink: 0;
        }

        .app-org-name {
          font-size: 16px;
          font-weight: 700;
          color: #3d2f1f;
        }

        /* ── Badges ── */
        .app-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
        }

        .app-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .app-badge-approved {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .app-badge-approved::before { background: #3a9e70; }

        .app-badge-pending {
          background: #faf0e0;
          color: #a0692a;
        }
        .app-badge-pending::before { background: #c89040; }

        .app-badge-rejected {
          background: #fce8e8;
          color: #b03030;
        }
        .app-badge-rejected::before { background: #d07070; }

        /* ── Card details ── */
        .app-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 6px 20px;
          margin-top: 10px;
        }

        .app-detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7d6550;
        }

        .app-detail-item svg {
          width: 15px;
          height: 15px;
          color: #c0a888;
          flex-shrink: 0;
        }

        .app-detail-item .label {
          color: #a89070;
        }

        .app-detail-item .value {
          color: #3d2f1f;
          font-weight: 500;
        }

        .app-description {
          margin-top: 10px;
          padding: 10px 14px;
          background: #faf8f5;
          border-radius: 8px;
          font-size: 13px;
          color: #5a3e28;
          border-left: 3px solid #c8a882;
        }

        /* ── Actions ── */
        .app-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          margin-left: 16px;
        }

        .app-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .app-btn-approve {
          background: #e8f5ef;
          color: #2e7d5a;
        }

        .app-btn-approve:hover {
          background: #d0ece0;
          transform: translateY(-1px);
        }

        .app-btn-reject {
          background: #fce8e8;
          color: #b03030;
        }

        .app-btn-reject:hover {
          background: #f8d8d8;
          transform: translateY(-1px);
        }

        /* ── Skeleton ── */
        .app-skeleton {
          height: 18px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .app-skeleton-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 12px;
        }

        .app-skeleton-card:last-child {
          margin-bottom: 0;
        }

        .app-skeleton-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .app-skeleton-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .app-skeleton-text {
          flex: 1;
        }

        .app-skeleton-text .app-skeleton {
          width: 60%;
          margin-bottom: 4px;
        }

        .app-skeleton-text .app-skeleton:last-child {
          width: 40%;
          height: 14px;
          margin-bottom: 0;
        }

        .app-skeleton-detail {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .app-skeleton-detail .app-skeleton {
          height: 14px;
        }

        .app-skeleton-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .app-skeleton-actions .app-skeleton {
          width: 80px;
          height: 34px;
          border-radius: 8px;
        }

        /* ── Empty ── */
        .app-empty {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 48px 16px;
          text-align: center;
          animation: fade-in-up 0.35s ease both;
        }

        .app-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .app-empty-text {
          font-weight: 500;
          color: #c0a888;
        }

        .app-empty-sub {
          font-size: 12px;
          color: #d5c8b8;
          margin-top: 4px;
        }

        /* ── Pagination ── */
        .app-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 16px;
          margin-top: 16px;
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
        }

        .app-page-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 9px;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .app-page-btn:hover:not(:disabled) {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .app-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .app-page-num {
          min-width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .app-page-num:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .app-page-num.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .app-stats {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .app-card-header {
            flex-direction: column;
          }

          .app-actions {
            margin-left: 0;
            width: 100%;
          }

          .app-actions .app-btn {
            flex: 1;
            justify-content: center;
          }

          .app-details {
            grid-template-columns: 1fr;
          }

          .app-filters {
            gap: 6px;
          }

          .app-filter-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .app-stats {
            grid-template-columns: 1fr 1fr;
          }

          .app-card-title-wrap {
            flex-wrap: wrap;
          }

          .app-org-name {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="app-container">
        {/* Stats */}
        <div className="app-stats">
          <div className="app-stat-card">
            <div className="app-stat-label">
              <Clock size={14} />
              Chờ duyệt
            </div>
            <div className="app-stat-value" style={{ color: "#a0692a" }}>
              {pendingCount}
            </div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-label">
              <CheckCircle size={14} />
              Đã duyệt
            </div>
            <div className="app-stat-value" style={{ color: "#2e7d5a" }}>
              {approvedCount}
            </div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-label">
              <XCircle size={14} />
              Từ chối
            </div>
            <div className="app-stat-value" style={{ color: "#b03030" }}>
              {rejectedCount}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="app-filters">
          {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`app-filter-btn${statusFilter === s ? " active" : ""}`}
            >
              {s === "PENDING"
                ? "⏳ Chờ duyệt"
                : s === "APPROVED"
                  ? "✅ Đã duyệt"
                  : s === "REJECTED"
                    ? "❌ Từ chối"
                    : "📋 Tất cả"}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="app-skeleton-card">
                <div className="app-skeleton-row">
                  <div className="app-skeleton-icon app-skeleton" />
                  <div className="app-skeleton-text">
                    <div className="app-skeleton" />
                    <div className="app-skeleton" />
                  </div>
                </div>
                <div className="app-skeleton-detail">
                  <div className="app-skeleton" />
                  <div className="app-skeleton" />
                  <div className="app-skeleton" />
                </div>
                <div className="app-skeleton-actions">
                  <div className="app-skeleton" />
                  <div className="app-skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="app-empty">
            <div className="app-empty-icon">📋</div>
            <p className="app-empty-text">Không có đơn đăng ký nào</p>
            <p className="app-empty-sub">
              {statusFilter === "PENDING"
                ? "Không có đơn nào đang chờ duyệt"
                : statusFilter === "APPROVED"
                  ? "Không có đơn nào đã được duyệt"
                  : statusFilter === "REJECTED"
                    ? "Không có đơn nào bị từ chối"
                    : "Chưa có đơn đăng ký nào được gửi"}
            </p>
          </div>
        ) : (
          <div>
            {applications.map((app) => (
              <div key={app.id} className="app-card">
                <div className="app-card-header">
                  <div className="app-card-left">
                    <div className="app-card-title-wrap">
                      <div className="app-org-icon">
                        <Building2 size={20} />
                      </div>
                      <span className="app-org-name">{app.organization}</span>
                      <span
                        className={`app-badge ${STATUS_CONFIG[app.status].color}`}
                      >
                        {STATUS_CONFIG[app.status].label}
                      </span>
                    </div>

                    <div className="app-details">
                      <div className="app-detail-item">
                        <User size={15} />
                        <span className="value">{app.user?.fullName}</span>
                      </div>
                      <div className="app-detail-item">
                        <Mail size={15} />
                        <span className="value">{app.user?.email}</span>
                      </div>
                      {app.contactPhone && (
                        <div className="app-detail-item">
                          <Phone size={15} />
                          <span className="value">{app.contactPhone}</span>
                        </div>
                      )}
                      <div className="app-detail-item">
                        <Calendar size={15} />
                        <span className="label">Gửi lúc </span>
                        <span className="value">
                          {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>

                    {app.description && (
                      <div className="app-description">{app.description}</div>
                    )}
                  </div>

                  {app.status === "PENDING" && (
                    <div className="app-actions">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="app-btn app-btn-approve"
                      >
                        <CheckCircle size={16} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="app-btn app-btn-reject"
                      >
                        <XCircle size={16} />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="app-pagination">
            <button
              className="app-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={15} />
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`app-page-num${p === page ? " active" : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              className="app-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
