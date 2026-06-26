import EventList from "@/components/event/EventList";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#F5E6D0] to-[var(--color-cream)] pt-20 pb-16 px-4 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-[var(--color-text-muted)] mb-8 border border-[var(--color-cream-dark)]">
            <span>🎪</span>
            <span>Mùa lễ hội 2026 — rất nhiều sự kiện đang mở bán</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] leading-tight mb-6">
            Mỗi khoảnh khắc,{" "}
            <span className="text-[var(--color-primary)]">một câu chuyện</span>{" "}
            đáng nhớ.
          </h1>

          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
            Khám phá và đặt vé những đêm nhạc, vở diễn, hội nghị và lễ hội đang
            chờ bạn trên khắp Việt Nam.
          </p>
        </div>
      </section>

      {/* Event List */}
      <EventList />

      {/* Banner Organizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[#C41E3A] rounded-3xl p-10 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-medium uppercase tracking-wider text-white/70 mb-3">
              Trở thành nhà tổ chức
            </p>
            <h2 className="text-3xl font-bold mb-4">
              Bạn có một sự kiện để chia sẻ với cộng đồng?
            </h2>
            <p className="text-white/80 mb-8">
              Đăng ký trở thành Organizer trên BianEvent — quản lý vé, check-in
              và doanh thu, tất cả ở một nơi.
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-white text-[var(--color-primary)] rounded-full font-semibold hover:bg-white/90 transition-colors"
            >
              Đăng ký Organizer
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute right-32 top-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full" />
        </div>
      </section>
    </>
  );
}
