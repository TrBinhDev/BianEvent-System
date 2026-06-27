/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Ticket, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { eventService } from "@/services/event.service";
import { bookingService } from "@/services/booking.service";
import { useAuthStore } from "@/stores/auth.store";
import { Event, TicketType } from "@/types/event.types";
import EventSlider from "@/components/event/EventSlider";
import {
  joinEventRoom,
  leaveEventRoom,
  onSlotUpdated,
  offSlotUpdated,
} from "@/lib/socket";
import toast from "react-hot-toast";
import Link from "next/link";

type LiveFeedItem = {
  id: number;
  ticketTypeName: string;
  quantity: number;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>([]);
  const liveFeedCounter = useRef(0);

  const fetchEvent = () => {
    eventService.getEventById(id).then((res) => {
      setEvent(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEvent();
    joinEventRoom(id);

    onSlotUpdated((data) => {
      fetchEvent();
      const newItem: LiveFeedItem = {
        id: ++liveFeedCounter.current,
        ticketTypeName: data.ticketTypeName,
        quantity: data.quantity,
      };
      setLiveFeed((prev) => [newItem, ...prev].slice(0, 5));
      setTimeout(() => {
        setLiveFeed((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 5000);
    });

    return () => {
      leaveEventRoom(id);
      offSlotUpdated();
    };
  }, [id]);

  const handleBooking = async () => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    if (!selectedTicket) {
      toast.error("Vui lòng chọn loại vé");
      return;
    }

    setBooking(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      await bookingService.createBooking(
        {
          ticketTypeId: selectedTicket.id,
          quantity,
        },
        idempotencyKey,
      );
      toast.success("Đặt vé thành công! Kiểm tra email để nhận vé.");
      fetchEvent();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đặt vé thất bại");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="aspect-[16/9] bg-[var(--color-cream-dark)] rounded-2xl mb-8" />
        <div className="h-8 bg-[var(--color-cream-dark)] rounded w-3/4 mb-4" />
        <div className="h-4 bg-[var(--color-cream-dark)] rounded w-1/2" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl">😕</span>
        <p className="text-[var(--color-text-muted)] mt-4">
          Không tìm thấy sự kiện
        </p>
        <Link
          href="/events"
          className="text-[var(--color-primary)] font-medium mt-4 block"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const isSaleOpen =
    new Date() >= new Date(event.saleStartAt) &&
    new Date() <= new Date(event.saleEndAt);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Quay lại
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Event info */}
        <div className="lg:col-span-2">
          {/* Slider */}
          <EventSlider
            coverUrl={event.coverUrl}
            images={event.images || []}
            title={event.title}
          />

          {/* Title + Category */}
          <div className="mt-6 mb-4">
            {event.category && (
              <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-cream-dark)] px-3 py-1 rounded-full">
                {event.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-[var(--color-text)] mt-3">
              {event.title}
            </h1>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <Calendar
                size={18}
                className="text-[var(--color-primary)] shrink-0"
              />
              <span>
                {format(new Date(event.startAt), "EEEE, dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <Clock
                size={18}
                className="text-[var(--color-primary)] shrink-0"
              />
              <span>
                {format(new Date(event.startAt), "HH:mm", { locale: vi })} —{" "}
                {format(new Date(event.endAt), "HH:mm", { locale: vi })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <MapPin
                size={18}
                className="text-[var(--color-primary)] shrink-0"
              />
              <span>
                {event.venueName}, {event.address}, {event.city}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="prose prose-sm max-w-none text-[var(--color-text-muted)] leading-relaxed mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                Giới thiệu
              </h3>
              <p>{event.description}</p>
            </div>
          )}

          {/* Live feed */}
          {liveFeed.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-col gap-2">
                {liveFeed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-xl px-4 py-2 animate-fade-in"
                  >
                    <span className="text-base">🎟️</span>
                    <span>
                      Ai đó vừa mua{" "}
                      <span className="font-semibold text-[var(--color-text)]">
                        {item.quantity} vé
                      </span>{" "}
                      <span className="text-[var(--color-primary)]">
                        {item.ticketTypeName}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seating map */}
          {event.seatingMapUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                Sơ đồ chỗ ngồi
              </h3>
              <img
                src={event.seatingMapUrl}
                alt="Sơ đồ chỗ ngồi"
                className="w-full rounded-xl border border-[var(--color-cream-dark)]"
              />
            </div>
          )}
        </div>

        {/* Right — Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-[var(--color-cream-dark)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Ticket size={20} className="text-[var(--color-primary)]" />
              Chọn vé
            </h3>

            {!isSaleOpen ? (
              <div className="text-center py-4">
                <p className="text-[var(--color-text-muted)] text-sm">
                  {new Date() < new Date(event.saleStartAt)
                    ? `Mở bán lúc ${format(new Date(event.saleStartAt), "HH:mm dd/MM/yyyy")}`
                    : "Đã hết thời gian bán vé"}
                </p>
              </div>
            ) : (
              <>
                {/* Ticket types */}
                <div className="flex flex-col gap-3 mb-5">
                  {event.ticketTypes.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() =>
                        ticket.availableSlots > 0 && setSelectedTicket(ticket)
                      }
                      disabled={ticket.availableSlots === 0}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTicket?.id === ticket.id
                          ? "border-[var(--color-primary)] bg-[var(--color-cream)]"
                          : ticket.availableSlots === 0
                            ? "border-[var(--color-cream-dark)] opacity-50 cursor-not-allowed"
                            : "border-[var(--color-cream-dark)] hover:border-[var(--color-primary)]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-[var(--color-text)] text-sm">
                          {ticket.name}
                        </span>
                        <span className="text-[var(--color-primary)] font-bold text-sm">
                          {Number(ticket.price) === 0
                            ? "Miễn phí"
                            : `${Number(ticket.price).toLocaleString("vi-VN")}đ`}
                        </span>
                      </div>
                      {ticket.zone && (
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {ticket.zone}
                        </p>
                      )}
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {ticket.availableSlots === 0
                          ? "Hết vé"
                          : `Còn ${ticket.availableSlots} vé`}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                {selectedTicket && (
                  <div className="mb-5">
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      Số lượng (tối đa 4)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-lg border border-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold text-[var(--color-text)] w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((q) =>
                            Math.min(4, q + 1, selectedTicket.availableSlots),
                          )
                        }
                        className="w-9 h-9 rounded-lg border border-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                {selectedTicket && (
                  <div className="flex justify-between items-center py-3 border-t border-[var(--color-cream-dark)] mb-4">
                    <span className="text-[var(--color-text-muted)] text-sm">
                      Tổng cộng
                    </span>
                    <span className="text-[var(--color-primary)] font-bold text-lg">
                      {(Number(selectedTicket.price) * quantity).toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </span>
                  </div>
                )}

                {/* Book button */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedTicket || booking}
                  className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking
                    ? "Đang xử lý..."
                    : isAuthenticated()
                      ? "Đặt vé ngay"
                      : "Đăng nhập để đặt vé"}
                </button>

                <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
                  Vé sẽ được gửi qua email sau khi đặt thành công
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
