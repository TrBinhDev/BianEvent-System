import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-cream-dark)] border-t border-[var(--color-cream-dark)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">B</span>
              </div>
              <span className="font-bold text-xl">
                <span className="text-[var(--color-text)]">Bian</span>
                <span className="text-[var(--color-primary)]">Event</span>
              </span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Nền tảng đặt vé sự kiện đáng tin cậy — kết nối khán giả với những
              đêm diễn, hội nghị và lễ hội đáng nhớ trên khắp Việt Nam.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4 uppercase text-xs tracking-wider">
              Khám phá
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/events"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Sự kiện sắp diễn ra
                </Link>
              </li>
              <li>
                <Link
                  href="/events?sort=popular"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Sự kiện nổi bật
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Danh mục
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4 uppercase text-xs tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="#"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--color-cream)] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--color-text-muted)] text-sm">
            © 2026 BianEvent. Được phát triển tại Hà Nội.
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Thiết kế bởi TrBinhDev
          </p>
        </div>
      </div>
    </footer>
  );
}
