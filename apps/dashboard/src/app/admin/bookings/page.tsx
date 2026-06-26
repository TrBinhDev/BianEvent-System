"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/booking.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  Ticket,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Đang xử lý", color: "uf-badge-pending" },
  CONFIRMED: { label: "Thành công", color: "uf-badge-confirmed" },
  FAILED: { label: "Thất bại", color: "uf-badge-failed" },
  CANCELLED: { label: "Đã huỷ", color: "uf-badge-cancelled" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getAllBookings({
          page,
          limit: 10,
          status: statusFilter || undefined,
        });
        setBookings(res.data);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page, statusFilter]);

  // Tính tổng số vé và doanh thu
  const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0,
  );

  return (
    <>
      <style>{`
        /* ── Container ── */
        .bk-container {
          width: 100%;
        }

        /* ── Stats cards ── */
        .bk-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .bk-stat-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 12px;
          padding: 16px 20px;
          animation: fade-in-up 0.35s ease both;
        }

        .bk-stat-card:nth-child(1) { animation-delay: 0.03s; }
        .bk-stat-card:nth-child(2) { animation-delay: 0.06s; }
        .bk-stat-card:nth-child(3) { animation-delay: 0.09s; }

        .bk-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bk-stat-label svg {
          width: 14px;
          height: 14px;
        }

        .bk-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #3d2f1f;
          margin-top: 4px;
        }

        /* ── Filters ── */
        .bk-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .bk-filter-wrap {
          position: relative;
        }

        .bk-filter-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0a888;
          pointer-events: none;
          width: 15px;
          height: 15px;
        }

        .bk-select {
          padding: 9px 32px 9px 36px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c0a888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .bk-select:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        /* ── Table card ── */
        .bk-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          overflow: hidden;
          animation: fade-in-up 0.35s ease both;
          animation-delay: 0.12s;
        }

        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .bk-table {
          width: 100%;
          border-collapse: collapse;
        }

        /* ── Head ── */
        .bk-thead tr {
          background: #faf8f5;
          border-bottom: 1px solid #e8e0d5;
        }

        .bk-th {
          padding: 11px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        /* ── Body ── */
        .bk-tr {
          border-bottom: 1px solid #f0ebe3;
          transition: background 0.15s;
        }

        .bk-tr:last-child { border-bottom: none; }

        .bk-tr:hover { background: #faf8f5; }

        .bk-td {
          padding: 12px 16px;
          font-size: 13.5px;
          color: #3d2f1f;
          vertical-align: middle;
        }

        /* ── Booking ID ── */
        .bk-id {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #3d2f1f;
          background: #faf8f5;
          padding: 2px 10px;
          border-radius: 6px;
          display: inline-block;
        }

        /* ── Status badges ── */
        .bk-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
        }

        .bk-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bk-badge-confirmed {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .bk-badge-confirmed::before { background: #3a9e70; }

        .bk-badge-pending {
          background: #faf0e0;
          color: #a0692a;
        }
        .bk-badge-pending::before { background: #c89040; }

        .bk-badge-failed {
          background: #fce8e8;
          color: #b03030;
        }
        .bk-badge-failed::before { background: #d07070; }

        .bk-badge-cancelled {
          background: #f0ebe3;
          color: #7d6550;
        }
        .bk-badge-cancelled::before { background: #c0a888; }

        /* ── Amount ── */
        .bk-amount {
          font-weight: 600;
          color: #3d2f1f;
        }

        /* ── Date ── */
        .bk-date {
          font-size: 12px;
          color: #a89070;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .bk-date svg {
          width: 13px;
          height: 13px;
        }

        /* ── Skeleton ── */
        .bk-skeleton {
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

        .bk-skeleton-cell {
          padding: 12px 16px;
        }

        .bk-skeleton-cell .bk-skeleton {
          width: 80%;
        }

        /* ── Empty ── */
        .bk-empty {
          padding: 48px 16px;
          text-align: center;
          color: #c0a888;
          font-size: 14px;
        }

        .bk-empty-icon {
          margin-bottom: 12px;
          color: #e8e0d5;
        }

        .bk-empty-text {
          font-weight: 500;
        }

        /* ── Pagination ── */
        .bk-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 16px;
          border-top: 1px solid #e8e0d5;
        }

        .bk-page-btn {
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

        .bk-page-btn:hover:not(:disabled) {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .bk-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .bk-page-num {
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

        .bk-page-num:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .bk-page-num.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .bk-stats {
            grid-template-columns: 1fr 1fr;
          }

          .bk-table {
            font-size: 12px;
          }

          .bk-th,
          .bk-td {
            padding: 8px 10px;
          }

          .bk-stats {
            gap: 10px;
          }

          .bk-stat-value {
            font-size: 17px;
          }
        }

        @media (max-width: 480px) {
          .bk-stats {
            grid-template-columns: 1fr;
          }

          .bk-filters {
            flex-direction: column;
          }

          .bk-select {
            width: 100%;
          }
        }
      `}</style>

      <div className="bk-container">
        {/* Stats */}
        <div className="bk-stats">
          <div className="bk-stat-card">
            <div className="bk-stat-label">
              <Ticket size={14} />
              Tổng đặt vé
            </div>
            <div className="bk-stat-value">{bookings.length}</div>
          </div>
          <div className="bk-stat-card">
            <div className="bk-stat-label">
              <Users size={14} />
              Tổng số vé
            </div>
            <div className="bk-stat-value">{totalTickets}</div>
          </div>
          <div className="bk-stat-card">
            <div className="bk-stat-label">
              <span>💰</span>
              Doanh thu
            </div>
            <div className="bk-stat-value">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bk-filters">
          <div className="bk-filter-wrap">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bk-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CONFIRMED">Thành công</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bk-card">
          <table className="bk-table">
            <thead className="bk-thead">
              <tr>
                <th className="bk-th">Mã đặt vé</th>
                <th className="bk-th">Số lượng</th>
                <th className="bk-th">Tổng tiền</th>
                <th className="bk-th">Trạng thái</th>
                <th className="bk-th">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="bk-tr">
                    <td className="bk-skeleton-cell">
                      <div className="bk-skeleton" style={{ width: "40%" }} />
                    </td>
                    <td className="bk-skeleton-cell">
                      <div className="bk-skeleton" style={{ width: "30%" }} />
                    </td>
                    <td className="bk-skeleton-cell">
                      <div className="bk-skeleton" style={{ width: "35%" }} />
                    </td>
                    <td className="bk-skeleton-cell">
                      <div className="bk-skeleton" style={{ width: "25%" }} />
                    </td>
                    <td className="bk-skeleton-cell">
                      <div className="bk-skeleton" style={{ width: "45%" }} />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="bk-empty">
                    <div className="bk-empty-icon">
                      <Ticket size={40} strokeWidth={1.5} />
                    </div>
                    <p className="bk-empty-text">Không có đặt vé nào</p>
                    <p style={{ fontSize: 12, color: "#d5c8b8", marginTop: 4 }}>
                      Chưa có giao dịch đặt vé nào được thực hiện
                    </p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="bk-tr">
                    <td className="bk-td">
                      <span className="bk-id">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="bk-td">
                      <span style={{ fontWeight: 500 }}>
                        {booking.quantity} vé
                      </span>
                    </td>
                    <td className="bk-td">
                      <span className="bk-amount">
                        {Number(booking.totalAmount).toLocaleString("vi-VN")}đ
                      </span>
                    </td>
                    <td className="bk-td">
                      <span
                        className={`bk-badge ${STATUS_CONFIG[booking.status].color}`}
                      >
                        {STATUS_CONFIG[booking.status].label}
                      </span>
                    </td>
                    <td className="bk-td">
                      <span className="bk-date">
                        <Calendar size={13} />
                        {format(
                          new Date(booking.createdAt),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: vi,
                          },
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bk-pagination">
              <button
                className="bk-page-btn"
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
                  className={`bk-page-num${p === page ? " active" : ""}`}
                >
                  {p}
                </button>
              ))}
              <button
                className="bk-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
