# Booking Service — Phân tích chi tiết

## Tổng quan

| Thuộc tính       | Giá trị                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| Port             | `:3003`                                                                         |
| Database         | PostgreSQL — `db_bookings` (Database-per-Service)                               |
| Cache            | Redis — seat lock, idempotency                                                  |
| Kafka            | Publish `booking.confirmed`, `booking.failed` — Consumer group: `booking-group` |
| Giao tiếp nội bộ | Gọi Event Service internal API để validate + trừ/hoàn slot                      |

---

## Booking Status Flow

```
PENDING → CONFIRMED
PENDING → FAILED
CONFIRMED → CANCELLED  (khi event bị huỷ)
```

- **PENDING** — đang xử lý, đã lock slot trong Redis
- **CONFIRMED** — đặt vé thành công, QR đã gửi qua email
- **FAILED** — đặt vé thất bại (hết slot, hết giờ lock...)
- **CANCELLED** — event bị huỷ bởi Organizer

---

## Database Schema

### Bảng `bookings`

```sql
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  event_id        UUID NOT NULL,
  ticket_type_id  UUID NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 4),
  total_amount    DECIMAL(12, 2) NOT NULL,
  status          ENUM('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  payment_status  ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Bảng `tickets`

```sql
CREATE TABLE tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  event_id    UUID NOT NULL,
  status      ENUM('ACTIVE', 'USED', 'CANCELLED') DEFAULT 'ACTIVE',
  created_at  TIMESTAMP DEFAULT NOW()
);
```

> Mỗi booking có `quantity` tickets riêng lẻ. QR generate on-the-fly từ `ticket.id`, không lưu ảnh.

### Bảng `booking_status_logs`

```sql
CREATE TABLE booking_status_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  from_status ENUM('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'),
  to_status   ENUM('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED') NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Redis Keys

```
lock:ticket:{ticketTypeId}:{userId}   — seat lock, TTL: 5 phút
booking:idempotency:{userId}:{ticketTypeId} — chống duplicate request, TTL: 10 giây
booking:user-event:{userId}:{eventId} — tổng vé user đã đặt cho event này
```

---

## API Endpoints

### User / Organizer — `/api/bookings`

| Method | Endpoint                                      | Role      | Mô tả                                              |
| ------ | --------------------------------------------- | --------- | -------------------------------------------------- |
| POST   | `/bookings`                                   | USER      | Đặt vé — trigger toàn bộ flow xử lý               |
| GET    | `/bookings/my`                                | USER      | Lịch sử đặt vé của mình, pagination               |
| GET    | `/bookings/my/:id`                            | USER      | Chi tiết 1 booking kèm danh sách tickets           |
| GET    | `/bookings/organizer/events/:eventId/bookings`| ORGANIZER | Danh sách đơn đặt vé của 1 event (kèm tên user)   |
| PATCH  | `/bookings/tickets/:ticketId/checkin`         | ORGANIZER | Check-in vé tại sự kiện, đổi ticket status → USED  |

### Admin — `/api/admin`

| Method | Endpoint              | Role  | Mô tả                                         |
| ------ | --------------------- | ----- | --------------------------------------------- |
| GET    | `/admin/bookings`     | ADMIN | Tất cả booking, filter theo status/event/user |
| GET    | `/admin/bookings/:id` | ADMIN | Chi tiết booking kèm status logs              |

### Internal — `/internal`

> Không expose qua API Gateway, chỉ gọi service-to-service trong Docker network

| Method | Endpoint                               | Caller               | Mô tả                                                                  |
| ------ | -------------------------------------- | -------------------- | ---------------------------------------------------------------------- |
| GET    | `/internal/bookings/by-event/:eventId` | Notification Service | Lấy danh sách `{ userId, email, fullName }` đã đặt vé khi event bị huỷ |

---

**Tổng: 8 API** (5 user/organizer + 2 admin + 1 internal)

---

## Kafka

### Publish

| Topic               | Khi nào            | Payload                                                                                                                                                  |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `booking.confirmed` | Booking thành công | `{ bookingId, userId, eventId, email, fullName, eventTitle, ticketTypeName, zone, quantity, totalAmount, startAt, venueName, tickets: [{ ticketId }] }` |
| `booking.failed`    | Booking thất bại   | `{ userId, email, fullName, eventTitle, reason }`                                                                                                        |

### Consume

| Topic             | Group           | Xử lý                                                                            |
| ----------------- | --------------- | -------------------------------------------------------------------------------- |
| `event.cancelled` | `booking-group` | Cập nhật tất cả booking của event đó thành CANCELLED, hoàn slot về Event Service |

---

## Flow đặt vé chi tiết

### Happy path (đặt thành công)

```
POST /bookings { ticketTypeId, quantity }

1. Validate input
   → quantity phải từ 1-4
   → Kiểm tra Redis booking:user-event:{userId}:{eventId}
     → Tổng vé hiện tại + quantity <= 4, nếu vượt → reject

2. Idempotency check
   → SET booking:idempotency:{userId}:{ticketTypeId} NX EX 10
   → Nếu key đã tồn tại → duplicate request → reject

3. Gọi Event Service internal API
   → GET /internal/ticket-types/:id
   → Validate: event còn PUBLISHED không?
   → Validate: hiện tại có trong sale window không? (sale_start_at <= now <= sale_end_at)
   → Validate: available_slots >= quantity không?

4. Redis seat lock
   → SET lock:ticket:{ticketTypeId}:{userId} 1 NX EX 300
   → Nếu không SET được → người khác đang lock → reject "Vé đang được xử lý"

5. Gọi Event Service internal API trừ slot
   → PATCH /internal/ticket-types/:id/slots/decrement { quantity }
   → Dùng SELECT FOR UPDATE tránh race condition

6. Tạo booking record trong DB
   → status: CONFIRMED (vì chưa có payment)
   → Tạo N ticket records tương ứng với quantity
   → Lưu booking_status_logs: PENDING → CONFIRMED

7. Cập nhật Redis booking:user-event:{userId}:{eventId}
   → Cộng thêm quantity vào tổng

8. Xoá seat lock
   → DEL lock:ticket:{ticketTypeId}:{userId}

9. Publish Kafka: booking.confirmed (kèm danh sách ticketId)

10. Trả về response: booking details
```

### Sad path (đặt thất bại)

```
Nếu bất kỳ bước nào từ 3-6 thất bại:
  → Nếu đã trừ slot → gọi PATCH /internal/ticket-types/:id/slots/increment hoàn lại
  → Cập nhật booking status: FAILED (nếu đã tạo record)
  → Lưu booking_status_logs: PENDING → FAILED (kèm reason)
  → Xoá seat lock nếu đã lock
  → Publish Kafka: booking.failed
  → Trả về lỗi rõ ràng cho client
```

### Event bị huỷ (consume event.cancelled)

```
Nhận Kafka event.cancelled { eventId }
  → Lấy tất cả booking CONFIRMED của eventId
  → Cập nhật bookings.status → CANCELLED
  → Cập nhật tickets.status → CANCELLED
  → Lưu booking_status_logs: CONFIRMED → CANCELLED (reason: "Event bị huỷ")
  → Gọi Event Service PATCH /internal/ticket-types/:id/slots/increment hoàn lại slot
```

---

## Cấu trúc thư mục Service

```
services/booking-service/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── modules/
│   │   ├── bookings/
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   ├── bookings.routes.ts
│   │   │   └── bookings.dto.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   ├── internal/
│   │   ├── internal.controller.ts
│   │   └── internal.routes.ts
│   ├── kafka/
│   │   ├── producer.ts
│   │   └── handlers/
│   │       └── event.handler.ts    # consume event.cancelled
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   └── error-handler.ts
│   ├── utils/
│   │   └── redis.ts                # seat lock helpers
│   └── app.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── .env.example
└── package.json
```

---

## Environment Variables

```env
# App
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db_bookings

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=booking-service
KAFKA_GROUP_ID=booking-group

# Internal
INTERNAL_API_KEY=your_internal_secret
EVENT_SERVICE_URL=http://event-service:3002
USER_SERVICE_URL=http://user-service:3001
```

---

## Implementation Rules

**Race condition:**

- Luôn dùng Redis `SET NX` cho seat lock trước khi trừ slot
- Trừ slot ở Event Service phải dùng `SELECT FOR UPDATE` (PostgreSQL row lock)
- Idempotency key chống duplicate request trong 10 giây

**Rollback:**

- Nếu trừ slot thành công nhưng tạo booking thất bại → phải hoàn slot ngay lập tức
- Luôn xoá seat lock dù thành công hay thất bại (dùng try/finally)
- Mọi thay đổi trạng thái phải được log vào `booking_status_logs`

**Business rules:**

- Mỗi lần đặt tối đa 4 vé
- Tổng vé của 1 user cho 1 event tối đa 4 (cộng dồn)
- Không cho phép huỷ booking từ phía user
- Chỉ booking status CONFIRMED mới có tickets
- QR generate on-the-fly từ `ticketId` — không lưu ảnh
- Booking chỉ được tạo trong sale window của event

**Internal:**

- Internal endpoints bảo vệ bằng `x-internal-key` header
- Khi gọi Event Service internal API thất bại → retry tối đa 3 lần trước khi báo lỗi
