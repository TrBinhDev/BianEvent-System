import Link from "next/link";
import { MapPin, Calendar, Ticket } from "lucide-react";
import { Event } from "@/types/event.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const minPrice =
    event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
      : 0;

  const totalSlots = event.ticketTypes.reduce(
    (sum, t) => sum + t.availableSlots,
    0,
  );
  const isSoldOut = totalSlots === 0;

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-[var(--color-cream-dark)] h-full flex flex-col">
        {/* Cover Image - fixed aspect ratio */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-cream-dark)] flex-shrink-0">
          {event.coverUrl ? (
            <img
              src={event.coverUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[var(--color-text-muted)] text-4xl">
                🎭
              </span>
            </div>
          )}

          {/* Category badge */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-[var(--color-primary)] text-xs font-medium px-2.5 py-1 rounded-full">
                {event.category.name}
              </span>
            </div>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Hết vé</span>
            </div>
          )}
        </div>

        {/* Content - flex column để đẩy footer xuống dưới */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title - fixed height 2 lines */}
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-snug line-clamp-2 min-h-[48px] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
            {event.title}
          </h3>

          {/* Meta info - flex-1 để đẩy xuống */}
          <div className="flex flex-col gap-2 mb-4 flex-1">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <Calendar size={14} className="shrink-0" />
              <span className="line-clamp-1">
                {format(new Date(event.startAt), "EEEE, dd/MM/yyyy • HH:mm", {
                  locale: vi,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">
                {event.venueName}, {event.city}
              </span>
            </div>
          </div>

          {/* Footer - luôn ở dưới cùng */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-cream-dark)] mt-auto">
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs">
              <Ticket size={13} />
              <span>{totalSlots} vé còn lại</span>
            </div>
            <div className="text-right">
              {minPrice === 0 ? (
                <span className="text-[var(--color-primary)] font-semibold text-sm">
                  Miễn phí
                </span>
              ) : (
                <span className="text-[var(--color-primary)] font-semibold text-sm">
                  Từ {minPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
