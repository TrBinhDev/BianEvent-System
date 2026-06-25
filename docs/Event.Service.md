# Event Service — Phân tích chi tiết

## Tổng quan

| Thuộc tính       | Giá trị                                         |
| ---------------- | ----------------------------------------------- |
| Port             | `:3002`                                         |
| Database         | PostgreSQL — `db_events` (Database-per-Service) |
| Storage          | Cloudflare R2 — cover, gallery, seating map     |
| Kafka            | Publish `event.created`, `event.cancelled`      |
| Giao tiếp nội bộ | Internal REST API cho Booking Service           |

---

## Event Status Flow

```
DRAFT → PUBLISHED → CANCELLED
```

- **DRAFT** — Organizer tạo xong nhưng chưa muốn public, đang chỉnh sửa
- **PUBLISHED** — public, user thấy và mua vé được
- **CANCELLED** — huỷ event, không mua vé được nữa

> Organizer tự chuyển DRAFT → PUBLISHED, không cần Admin duyệt.
> Organizer được sửa thoải mái kể cả sau khi PUBLISHED (giá vé, slot, thông tin).

---

## Database Schema

### Bảng `categories`

```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Bảng `events`

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id    UUID NOT NULL,
  category_id     UUID REFERENCES categories(id),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  cover_url       VARCHAR(500),
  seating_map_url VARCHAR(500),
  status          ENUM('DRAFT', 'PUBLISHED', 'CANCELLED') DEFAULT 'DRAFT',

  -- Location
  venue_name      VARCHAR(255) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  lat             DECIMAL(10, 8),
  lng             DECIMAL(11, 8),

  -- Time
  start_at        TIMESTAMP NOT NULL,
  end_at          TIMESTAMP NOT NULL,
  sale_start_at   TIMESTAMP NOT NULL,
  sale_end_at     TIMESTAMP NOT NULL,

  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Bảng `event_images`

```sql
CREATE TABLE event_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  order       INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Bảng `ticket_types`

```sql
CREATE TABLE ticket_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  price           DECIMAL(12, 2) NOT NULL,
  total_slots     INTEGER NOT NULL,
  available_slots INTEGER NOT NULL,
  zone            VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

> `available_slots` là source of truth — Booking Service gọi internal API để trừ/hoàn slot.

---

## API Endpoints

### Public — `/api/events`

| Method | Endpoint             | Role   | Mô tả                                                                                              |
| ------ | -------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| GET    | `/events`            | Public | Danh sách event PUBLISHED, filter theo `city`, `category`, `date`, search theo `title`, pagination |
| GET    | `/events/:id`        | Public | Chi tiết event kèm danh sách ticket types và available slots                                       |
| GET    | `/events/categories` | Public | Danh sách categories                                                                               |

### Organizer — `/api/organizer`

| Method | Endpoint                                     | Role      | Mô tả                                               |
| ------ | -------------------------------------------- | --------- | --------------------------------------------------- |
| GET    | `/organizer/events`                          | ORGANIZER | Danh sách event của mình, filter theo status        |
| POST   | `/organizer/events`                          | ORGANIZER | Tạo event mới, status mặc định DRAFT                |
| GET    | `/organizer/events/:id`                      | ORGANIZER | Xem chi tiết event của mình                         |
| PATCH  | `/organizer/events/:id`                      | ORGANIZER | Sửa thông tin event                                 |
| PATCH  | `/organizer/events/:id/status`               | ORGANIZER | Chuyển status: DRAFT→PUBLISHED, PUBLISHED→CANCELLED |
| DELETE | `/organizer/events/:id`                      | ORGANIZER | Xoá event (chỉ khi DRAFT)                           |
| POST   | `/organizer/events/:id/cover`                | ORGANIZER | Upload ảnh cover (multipart/form-data)              |
| POST   | `/organizer/events/:id/images`               | ORGANIZER | Upload ảnh gallery, tối đa 10 ảnh                   |
| DELETE | `/organizer/events/:id/images/:imageId`      | ORGANIZER | Xoá 1 ảnh gallery                                   |
| POST   | `/organizer/events/:id/seating-map`          | ORGANIZER | Upload ảnh sơ đồ chỗ ngồi                           |
| POST   | `/organizer/events/:id/ticket-types`         | ORGANIZER | Tạo loại vé cho event                               |
| PATCH  | `/organizer/events/:id/ticket-types/:typeId` | ORGANIZER | Sửa loại vé                                         |
| DELETE | `/organizer/events/:id/ticket-types/:typeId` | ORGANIZER | Xoá loại vé                                         |
| GET    | `/organizer/events/:id/stats`                | ORGANIZER | Thống kê: số vé đã bán theo từng loại               |

### Admin — `/api/admin`

| Method | Endpoint                   | Role  | Mô tả                                            |
| ------ | -------------------------- | ----- | ------------------------------------------------ |
| GET    | `/admin/events`            | ADMIN | Danh sách tất cả event mọi status, mọi organizer |
| PATCH  | `/admin/events/:id/status` | ADMIN | Ẩn / huỷ event vi phạm                           |
| GET    | `/admin/categories`        | ADMIN | Danh sách categories                             |
| POST   | `/admin/categories`        | ADMIN | Tạo category mới                                 |
| PATCH  | `/admin/categories/:id`    | ADMIN | Sửa category                                     |
| DELETE | `/admin/categories/:id`    | ADMIN | Xoá category                                     |

### Internal — `/internal`

> Không expose qua API Gateway, chỉ gọi service-to-service trong Docker network

| Method | Endpoint                                     | Caller          | Mô tả                                               |
| ------ | -------------------------------------------- | --------------- | --------------------------------------------------- |
| GET    | `/internal/events/:id`                       | Booking Service | Lấy thông tin event để validate booking             |
| GET    | `/internal/ticket-types/:id`                 | Booking Service | Lấy thông tin ticket type, kiểm tra sale window     |
| PATCH  | `/internal/ticket-types/:id/slots/decrement` | Booking Service | Trừ available_slots khi booking thành công          |
| PATCH  | `/internal/ticket-types/:id/slots/increment` | Booking Service | Hoàn available_slots khi booking thất bại / hết giờ |

---

**Tổng: 27 API** (3 public + 14 organizer + 6 admin + 4 internal)

---

## Kafka

### Publish

| Topic             | Khi nào                                     | Payload                                          |
| ----------------- | ------------------------------------------- | ------------------------------------------------ |
| `event.created`   | Organizer publish event (DRAFT → PUBLISHED) | `{ eventId, organizerId, title, city, startAt }` |
| `event.cancelled` | Event bị huỷ                                | `{ eventId, organizerId, title, startAt }`       |

> Notification Service consume `event.cancelled` để gửi email thông báo đến những user đã đặt vé.

---

## Flows quan trọng

### Tạo event

```
POST /organizer/events
  → Tạo event, status: DRAFT
  → Organizer upload ảnh, tạo ticket types
  → Sẵn sàng thì PATCH /status → PUBLISHED
  → Publish Kafka: event.created
```

### Huỷ event

```
PATCH /organizer/events/:id/status { status: CANCELLED }
  → Cập nhật status: CANCELLED
  → Publish Kafka: event.cancelled
  → Notification Service gửi email cho toàn bộ user đã đặt vé
  → Booking Service consume event.cancelled → cập nhật booking status
```

### Trừ / hoàn slot (gọi từ Booking Service)

```
-- Khi booking thành công:
PATCH /internal/ticket-types/:id/slots/decrement
  → available_slots = available_slots - quantity
  → Dùng transaction + row lock để tránh race condition

-- Khi booking thất bại hoặc hết giờ:
PATCH /internal/ticket-types/:id/slots/increment
  → available_slots = available_slots + quantity
```

---

## Business Rules

- Organizer chỉ quản lý được event của mình, không xem được event của Organizer khác
- Chỉ xoá được event khi status là DRAFT
- CANCELLED không thể chuyển về DRAFT hoặc PUBLISHED
- `available_slots` không được vượt quá `total_slots`
- `sale_end_at` phải trước `start_at`
- `sale_start_at` phải trước `sale_end_at`
- Gallery tối đa 10 ảnh mỗi event
- Upload ảnh stream thẳng lên R2, không lưu local
- `lat`, `lng` nullable — không bắt buộc nhập

---

## Cấu trúc thư mục Service

```
services/event-service/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── modules/
│   │   ├── events/
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.routes.ts
│   │   │   └── events.dto.ts
│   │   ├── organizer/
│   │   │   ├── organizer.controller.ts
│   │   │   ├── organizer.service.ts
│   │   │   ├── organizer.routes.ts
│   │   │   └── organizer.dto.ts
│   │   ├── ticket-types/
│   │   │   ├── ticket-types.controller.ts
│   │   │   ├── ticket-types.service.ts
│   │   │   └── ticket-types.dto.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   ├── internal/
│   │   ├── internal.controller.ts
│   │   └── internal.routes.ts
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   └── error-handler.ts
│   ├── kafka/
│   │   └── producer.ts
│   ├── storage/
│   │   └── r2.ts
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
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db_events

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=event-service

# Object Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Internal
INTERNAL_API_KEY=your_internal_secret
```

---

## Implementation Rules

**Kiến trúc:**

- `available_slots` là source of truth, chỉ Event Service được cập nhật giá trị này
- Booking Service không được trực tiếp update bảng `ticket_types` — phải gọi qua internal API
- Internal endpoints bảo vệ bằng `x-internal-key` header, không dùng JWT
- Decrement/increment slots phải dùng PostgreSQL transaction + row-level lock (`SELECT FOR UPDATE`)

**Business:**

- Validate `sale_start_at < sale_end_at < start_at` khi tạo/sửa event
- Khi huỷ event phải publish Kafka `event.cancelled` để các service liên quan xử lý
- Organizer chỉ được thao tác event có `organizer_id` trùng với `userId` trong JWT
- Xoá ticket type chỉ được khi `available_slots === total_slots` (chưa có ai đặt)
