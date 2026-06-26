"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventImage } from "@/types/event.types";

interface EventSliderProps {
  coverUrl: string | null;
  images: EventImage[];
  title: string;
  autoPlay?: boolean; // ✅ Thêm prop
  interval?: number; // ✅ Thêm prop
}

export default function EventSlider({
  coverUrl,
  images,
  title,
  autoPlay = true, // ✅ Mặc định tự chạy
  interval = 5000, // ✅ 5 giây
}: EventSliderProps) {
  const allImages = [
    ...(coverUrl ? [{ id: "cover", url: coverUrl, order: -1 }] : []),
    ...images,
  ];

  const [current, setCurrent] = useState(0);

  // ✅ Auto-play effect
  useEffect(() => {
    if (!autoPlay || allImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, allImages.length]);

  if (allImages.length === 0) {
    return (
      <div className="aspect-[16/9] bg-[var(--color-cream-dark)] rounded-2xl flex items-center justify-center">
        <span className="text-6xl">🎭</span>
      </div>
    );
  }

  const prev = () =>
    setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));

  return (
    <div
      className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-black group"
      onMouseEnter={() => {}} // Có thể dùng để pause khi hover
      onMouseLeave={() => {}}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {allImages.map((img) => (
          <div key={img.id} className="shrink-0 w-full h-full">
            <img
              src={img.url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {allImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
