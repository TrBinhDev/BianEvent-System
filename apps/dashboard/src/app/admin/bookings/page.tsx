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
import styles from "./bookings.module.css";

const STATUS_CONFIG = {
  PENDING: { label: "Đang xử lý", color: styles.badgePending },
  CONFIRMED: { label: "Thành công", color: styles.badgeConfirmed },
  FAILED: { label: "Thất bại", color: styles.badgeFailed },
  CANCELLED: { label: "Đã huỷ", color: styles.badgeCancelled },
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

  const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0,
  );

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <Ticket size={14} />
            Tổng đặt vé
          </div>
          <div className={styles.statValue}>{bookings.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <Users size={14} />
            Tổng số vé
          </div>
          <div className={styles.statValue}>{totalTickets}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>💰</span>
            Doanh thu
          </div>
          <div className={styles.statValue}>
            {totalRevenue.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterWrap}>
          <Filter size={15} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={styles.select}
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
      <div className={styles.card}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Mã đặt vé</th>
              <th className={styles.th}>Số lượng</th>
              <th className={styles.th}>Tổng tiền</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th}>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.skeletonCell}>
                    <div className={styles.skeleton} style={{ width: "40%" }} />
                  </td>
                  <td className={styles.skeletonCell}>
                    <div className={styles.skeleton} style={{ width: "30%" }} />
                  </td>
                  <td className={styles.skeletonCell}>
                    <div className={styles.skeleton} style={{ width: "35%" }} />
                  </td>
                  <td className={styles.skeletonCell}>
                    <div className={styles.skeleton} style={{ width: "25%" }} />
                  </td>
                  <td className={styles.skeletonCell}>
                    <div className={styles.skeleton} style={{ width: "45%" }} />
                  </td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <Ticket size={40} strokeWidth={1.5} />
                  </div>
                  <p className={styles.emptyText}>Không có đặt vé nào</p>
                  <p className={styles.emptySub}>
                    Chưa có giao dịch đặt vé nào được thực hiện
                  </p>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.id}>
                      {booking.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.quantity}>
                      {booking.quantity} vé
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.amount}>
                      {Number(booking.totalAmount).toLocaleString("vi-VN")}đ
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.badge} ${STATUS_CONFIG[booking.status].color}`}
                    >
                      {STATUS_CONFIG[booking.status].label}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.date}>
                      <Calendar size={13} />
                      {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
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
                className={`${styles.pageNum}${p === page ? ` ${styles.active}` : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
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
  );
}
