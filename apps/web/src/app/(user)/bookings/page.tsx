"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Calendar, MapPin, ChevronRight } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/booking.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Thành công", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Đã huỷ", color: "bg-gray-100 text-gray-600" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getMyBookings({
          page,
          limit: 10,
          status: activeTab || undefined,
        });
        setBookings(res.data);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page, activeTab]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Ticket size={24} className="text-[var(--color-primary)]" />
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Vé của tôi
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { value: "", label: "Tất cả" },
          { value: "CONFIRMED", label: "Thành công" },
          { value: "PENDING", label: "Đang xử lý" },
          { value: "CANCELLED", label: "Đã huỷ" },
          { value: "FAILED", label: "Thất bại" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-text-muted)] border border-[var(--color-cream-dark)] hover:border-[var(--color-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 animate-pulse border border-[var(--color-cream-dark)]"
            >
              <div className="h-5 bg-[var(--color-cream-dark)] rounded w-2/3 mb-3" />
              <div className="h-4 bg-[var(--color-cream-dark)] rounded w-1/2 mb-2" />
              <div className="h-4 bg-[var(--color-cream-dark)] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🎫</span>
          <p className="text-[var(--color-text-muted)] mt-4 text-lg">
            Chưa có vé nào
          </p>
          <Link
            href="/events"
            className="inline-block mt-4 px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Khám phá sự kiện
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <div className="bg-white rounded-2xl p-5 border border-[var(--color-cream-dark)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_LABEL[booking.status].color}`}
                      >
                        {STATUS_LABEL[booking.status].label}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {booking.quantity} vé
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Mã đặt vé: {booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                  <span className="font-bold text-[var(--color-primary)]">
                    {Number(booking.totalAmount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${
                p === page
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
