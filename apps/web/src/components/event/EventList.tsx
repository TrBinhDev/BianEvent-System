"use client";

import { useState, useEffect, useTransition } from "react";
import { Search } from "lucide-react";
import EventCard from "./EventCard";
import { eventService } from "@/services/event.service";
import { Event, Category } from "@/types/event.types";

export default function EventList() {
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    eventService.getCategories().then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    startTransition(() => {
      eventService
        .getEvents({
          page,
          limit: 9,
          categoryId: selectedCategory || undefined,
          search: search || undefined,
          city: city || undefined,
        })
        .then((res) => {
          setEvents(res.data);
          setTotalPages(res.pagination.totalPages);
        });
    });
  }, [page, selectedCategory, search, city]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="Tìm sự kiện, địa điểm, thành phố..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <button
          onClick={() => handleCategorySelect("")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === ""
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white text-[var(--color-text-muted)] border border-[var(--color-cream-dark)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-text-muted)] border border-[var(--color-cream-dark)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Sự kiện đang mở bán
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Chọn một danh mục để khám phá điều bạn yêu thích
          </p>
        </div>
      </div>

      {/* Events grid */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/9] bg-[var(--color-cream-dark)]" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-[var(--color-cream-dark)] rounded w-3/4" />
                <div className="h-3 bg-[var(--color-cream-dark)] rounded w-1/2" />
                <div className="h-3 bg-[var(--color-cream-dark)] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🎭</span>
          <p className="text-[var(--color-text-muted)] mt-4 text-lg">
            Không tìm thấy sự kiện nào
          </p>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="mt-4 text-[var(--color-primary)] font-medium hover:underline"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
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
                  : "border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}
