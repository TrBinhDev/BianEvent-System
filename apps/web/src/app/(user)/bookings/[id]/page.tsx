"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Ticket, Calendar, MapPin, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { bookingService } from "@/services/booking.service";
import { eventService } from "@/services/event.service";
import { Booking } from "@/types/booking.types";
import { Event } from "@/types/event.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Thành công", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Đã huỷ", color: "bg-gray-100 text-gray-600" },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getMyBookingById(id).then((res) => {
      setBooking(res.data);
      // Fetch event info
      eventService
        .getEventById(res.data.eventId)
        .then((eventRes) => {
          setEvent(eventRes.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-6 bg-[var(--color-cream-dark)] rounded w-1/3 mb-8" />
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-cream-dark)]">
          <div className="h-8 bg-[var(--color-cream-dark)] rounded w-2/3 mb-4" />
          <div className="h-4 bg-[var(--color-cream-dark)] rounded w-1/2 mb-3" />
          <div className="h-4 bg-[var(--color-cream-dark)] rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl">😕</span>
        <p className="text-[var(--color-text-muted)] mt-4">
          Không tìm thấy booking
        </p>
        <Link
          href="/bookings"
          className="text-[var(--color-primary)] font-medium mt-4 block"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Vé của tôi
      </Link>

      {/* Booking header */}
      <div className="bg-white rounded-2xl border border-[var(--color-cream-dark)] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[#C41E3A] p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Mã đặt vé</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white`}
            >
              {STATUS_LABEL[booking.status].label}
            </span>
          </div>
          <p className="font-mono text-lg font-bold">
            {booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="p-6">
          {/* Event info */}
          {event && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">
                {event.title}
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                  <Calendar size={15} className="text-[var(--color-primary)]" />
                  <span>
                    {format(new Date(event.startAt), "EEEE, dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                  <Clock size={15} className="text-[var(--color-primary)]" />
                  <span>
                    {format(new Date(event.startAt), "HH:mm", { locale: vi })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                  <MapPin size={15} className="text-[var(--color-primary)]" />
                  <span>
                    {event.venueName}, {event.city}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Booking info */}
          <div className="border-t border-[var(--color-cream-dark)] pt-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Số lượng vé
                </p>
                <p className="font-semibold text-[var(--color-text)]">
                  {booking.quantity} vé
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Tổng tiền
                </p>
                <p className="font-semibold text-[var(--color-primary)]">
                  {Number(booking.totalAmount).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Ngày đặt
                </p>
                <p className="font-semibold text-[var(--color-text)]">
                  {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Thanh toán
                </p>
                <p className="font-semibold text-[var(--color-text)]">
                  {booking.paymentStatus === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Tickets */}
      {booking.status === "CONFIRMED" && booking.tickets.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Ticket size={20} className="text-[var(--color-primary)]" />
            Vé của bạn ({booking.tickets.length} vé)
          </h3>
          <div className="flex flex-col gap-4">
            {booking.tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-[var(--color-cream-dark)] p-6 flex flex-col items-center"
              >
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
                  Vé #{index + 1}
                </p>
                <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[var(--color-cream-dark)] mb-4">
                  <QRCodeSVG
                    value={ticket.id}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  {ticket.id.slice(0, 8).toUpperCase()}
                </p>
                <span
                  className={`mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    ticket.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : ticket.status === "USED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {ticket.status === "ACTIVE"
                    ? "Chưa sử dụng"
                    : ticket.status === "USED"
                      ? "Đã sử dụng"
                      : "Đã huỷ"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status logs */}
      {booking.statusLogs && booking.statusLogs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Lịch sử trạng thái
          </h3>
          <div className="flex flex-col gap-2">
            {booking.statusLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[var(--color-text-muted)]">
                  {log.reason || log.toStatus}
                </span>
                <span className="text-[var(--color-text-muted)] text-xs">
                  {format(new Date(log.createdAt), "dd/MM HH:mm", {
                    locale: vi,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
