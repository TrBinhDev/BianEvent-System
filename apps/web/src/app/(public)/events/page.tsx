import EventList from "@/components/event/EventList";

export const metadata = {
  title: "Khám phá sự kiện — BianEvent",
  description: "Tìm kiếm và đặt vé các sự kiện hấp dẫn trên khắp Việt Nam",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-[#F5E6D0] to-[var(--color-cream)] py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-[var(--color-text)] mb-3">
          Khám phá sự kiện
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Tìm kiếm những sự kiện phù hợp với bạn
        </p>
      </div>
      <EventList />
    </div>
  );
}
