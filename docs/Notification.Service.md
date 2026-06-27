# Notification Service — Phân tích chi tiết

## Tổng quan

| Thuộc tính     | Giá trị                              |
| -------------- | ------------------------------------ |
| Port           | `:3004`                              |
| Database       | PostgreSQL — `db_notifications`      |
| Email Provider | Resend                               |
| Realtime       | Socket.io                            |
| Kafka          | Consumer group: `notification-group` |

---

## Kafka Consumer

### Topics consume

| Topic                     | Khi nào                    | Xử lý                                                                      |
| ------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `user.registered`         | User đăng ký tài khoản mới | Gửi email OTP xác thực                                                     |
| `user.organizer_approved` | Admin duyệt đơn Organizer  | Gửi email chúc mừng + lưu notification                                     |
| `notification.send`       | Forgot password            | Gửi email reset password                                                   |
| `user.banned`             | Admin ban tài khoản        | Emit Socket `user_banned` đến `user:{userId}` — client force logout        |
| `event.created`           | Organizer publish event    | Lưu notification `EVENT_PUBLISHED` + emit Socket `event_published` đến organizer |
| `event.cancelled`         | Event bị huỷ               | Gửi email + lưu notification cho toàn bộ user đã đặt vé                   |
| `booking.confirmed`       | Đặt vé thành công          | Gửi email + emit Socket + lưu notification                                 |
| `booking.failed`          | Đặt vé thất bại            | Gửi email + emit Socket + lưu notification                                 |

### Kafka Payload mỗi topic

```typescript
// user.registered
{
  userId: string
  email: string
  fullName: string
  otp: string
}

// user.organizer_approved
{
  userId: string
  email: string
  fullName: string
}

// notification.send
{
  to: string
  type: 'RESET_PASSWORD'
  data: {
    resetLink: string
  }
}

// event.cancelled
{
  eventId: string
  title: string
  startAt: string
  bookedUserEmails: { userId: string, email: string, fullName: string }[]
}

// user.banned
{
  userId: string
}

// event.created
{
  eventId: string
  organizerId: string
  title: string
  city: string
  startAt: string
}

// booking.confirmed
{
  bookingId: string
  userId: string
  eventId: string
  email: string
  fullName: string
  eventTitle: string
  ticketTypeName: string
  quantity: number
  totalAmount: number
  startAt: string
  venueName: string
}

// booking.failed
{
  userId: string
  email: string
  fullName: string
  eventTitle: string
  reason: string
}
```

---

## Database Schema

### Bảng `notifications`

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  type        ENUM(
                'BOOKING_CONFIRMED',
                'BOOKING_FAILED',
                'EVENT_CANCELLED',
                'EVENT_PUBLISHED',
                'ORGANIZER_APPROVED'
              ) NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Notifications — `/api/notifications`

> Expose qua Gateway, yêu cầu Authenticated

| Method | Endpoint                      | Role          | Mô tả                                                           |
| ------ | ----------------------------- | ------------- | --------------------------------------------------------------- |
| GET    | `/notifications`              | Authenticated | Danh sách thông báo của user, pagination, filter theo `is_read` |
| GET    | `/notifications/unread-count` | Authenticated | Số thông báo chưa đọc — hiển thị badge chuông 🔔                |
| PATCH  | `/notifications/:id/read`     | Authenticated | Đánh dấu 1 thông báo đã đọc                                     |
| PATCH  | `/notifications/read-all`     | Authenticated | Đánh dấu tất cả thông báo đã đọc                                |

---

## Socket.io

### Events emit về client

| Event               | Trigger                      | Data                                                          | Phạm vi                         |
| ------------------- | ---------------------------- | ------------------------------------------------------------- | ------------------------------- |
| `booking_confirmed` | Consume `booking.confirmed`  | `{ bookingId, eventTitle, quantity }`                         | Emit đúng user đặt vé           |
| `booking_failed`    | Consume `booking.failed`     | `{ eventTitle, reason }`                                      | Emit đúng user đặt vé           |
| `slot_updated`      | Consume `booking.confirmed`  | `{ eventId, ticketTypeId, ticketTypeName, quantity, availableSlots }` | Emit tất cả user đang xem event |
| `new_notification`  | Mọi khi lưu notification mới | `{ id, title, body, type, createdAt }`                        | Emit đúng user nhận thông báo   |
| `user_banned`       | Consume `user.banned`        | `{ userId }`                                                  | Emit đúng user bị ban → force logout |
| `event_published`   | Consume `event.created`      | `{ eventId, title }`                                          | Emit đến organizer tạo event    |

### Room strategy

```
Mỗi user join room theo userId khi connect:
  socket.join(`user:${userId}`)

Mỗi user join room theo eventId khi xem trang chi tiết event:
  socket.join(`event:${eventId}`)

Emit booking_confirmed / booking_failed / new_notification:
  io.to(`user:${userId}`).emit(...)

Emit slot_updated:
  io.to(`event:${eventId}`).emit(...)
```

---

## Email Templates (React Email)

| Template                 | Topic trigger             | Nội dung                                                  |
| ------------------------ | ------------------------- | --------------------------------------------------------- |
| `OtpEmail`               | `user.registered`         | OTP 6 số, hướng dẫn xác thực, hết hạn 10 phút             |
| `OrganizerApprovedEmail` | `user.organizer_approved` | Chúc mừng, hướng dẫn vào dashboard tạo event              |
| `ResetPasswordEmail`     | `notification.send`       | Link reset password, hết hạn 10 phút                      |
| `EventCancelledEmail`    | `event.cancelled`         | Tên event, ngày giờ bị huỷ                                |
| `BookingConfirmedEmail`  | `booking.confirmed`       | Chi tiết vé: event, loại vé, số lượng, địa điểm, ngày giờ |
| `BookingFailedEmail`     | `booking.failed`          | Tên event, lý do thất bại                                 |

---

## Cấu trúc thư mục Service

```
services/notification-service/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── kafka/
│   │   ├── consumer.ts
│   │   └── handlers/
│   │       ├── user.handler.ts
│   │       ├── notification.handler.ts
│   │       ├── event.handler.ts
│   │       └── booking.handler.ts
│   ├── socket/
│   │   └── socket.ts
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates/
│   │       ├── OtpEmail.tsx
│   │       ├── OrganizerApprovedEmail.tsx
│   │       ├── ResetPasswordEmail.tsx
│   │       ├── EventCancelledEmail.tsx
│   │       ├── BookingConfirmedEmail.tsx
│   │       └── BookingFailedEmail.tsx
│   ├── modules/
│   │   └── notifications/
│   │       ├── notifications.controller.ts
│   │       ├── notifications.service.ts
│   │       └── notifications.routes.ts
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   └── error-handler.ts
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
PORT=3004
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db_notifications

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-group

# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (dùng trong email template)
WEB_URL=http://localhost:4000
DASHBOARD_URL=http://localhost:4001
```

---

## Implementation Rules

**Kafka:**

- Dùng consumer group `notification-group` để Kafka lưu offset — service restart không mất message
- Mỗi handler phải idempotent — cùng 1 message gửi nhiều lần không được lưu notification trùng hoặc gửi email trùng
- Xử lý lỗi từng message riêng lẻ — 1 message lỗi không được làm crash toàn bộ consumer
- Log rõ ràng khi nhận message, khi gửi email thành công/thất bại

**Socket.io:**

- User phải gửi `userId` khi connect để join room `user:{userId}`
- User gửi `eventId` khi vào trang chi tiết event để join room `event:{eventId}`
- User rời trang chi tiết event phải leave room `event:{eventId}`
- Emit `new_notification` mỗi khi lưu notification mới vào DB để client cập nhật badge realtime

**Email:**

- Không tự gửi email trực tiếp từ các service khác — tất cả đi qua Kafka → Notification Service
- Template dùng React Email, render thành HTML trước khi gửi qua Resend

**Database:**

- Chỉ lưu notification cho các loại cần user xem lại: `BOOKING_CONFIRMED`, `BOOKING_FAILED`, `EVENT_CANCELLED`, `EVENT_PUBLISHED`, `ORGANIZER_APPROVED`
- Không lưu notification cho OTP và reset password — đây là email transactional, không cần hiển thị trong app
