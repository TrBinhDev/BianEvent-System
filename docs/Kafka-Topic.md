# Kafka Topic Map — Toàn hệ thống

## Cấu hình chung

| Thuộc tính           | Giá trị           |
| -------------------- | ----------------- |
| Brokers              | `localhost:9092`  |
| Partitions mỗi topic | 1                 |
| Replication factor   | 1 (dev), 3 (prod) |

---

## Danh sách Topics

### `user.registered`

| Thuộc tính | Giá trị                                     |
| ---------- | ------------------------------------------- |
| Publisher  | User Service                                |
| Consumer   | Notification Service (`notification-group`) |
| Khi nào    | User đăng ký tài khoản thành công           |

```typescript
payload: {
  userId: string;
  email: string;
  fullName: string;
  otp: string; // OTP 6 số xác thực email
}
```

Notification Service xử lý: gửi email OTP xác thực.

---

### `user.organizer_approved`

| Thuộc tính | Giá trị                                     |
| ---------- | ------------------------------------------- |
| Publisher  | User Service                                |
| Consumer   | Notification Service (`notification-group`) |
| Khi nào    | Admin duyệt đơn apply Organizer             |

```typescript
payload: {
  userId: string;
  email: string;
  fullName: string;
}
```

Notification Service xử lý: gửi email chúc mừng + lưu notification.

---

### `notification.send`

| Thuộc tính | Giá trị                                     |
| ---------- | ------------------------------------------- |
| Publisher  | User Service                                |
| Consumer   | Notification Service (`notification-group`) |
| Khi nào    | User yêu cầu reset password                 |

```typescript
payload: {
  to: string;
  type: "RESET_PASSWORD";
  data: {
    resetLink: string;
  }
}
```

Notification Service xử lý: gửi email reset password.

---

### `event.created`

| Thuộc tính | Giá trị                                     |
| ---------- | ------------------------------------------- |
| Publisher  | Event Service                               |
| Consumer   | Không có (reserved cho sau)                 |
| Khi nào    | Organizer publish event (DRAFT → PUBLISHED) |

```typescript
payload: {
  eventId: string;
  organizerId: string;
  title: string;
  city: string;
  startAt: string;
}
```

> Topic này khai báo sẵn, chưa có consumer. Sau này có thể dùng để gợi ý event cho user theo thành phố.

---

### `event.cancelled`

| Thuộc tính | Giá trị                                                                        |
| ---------- | ------------------------------------------------------------------------------ |
| Publisher  | Event Service                                                                  |
| Consumer   | Notification Service (`notification-group`), Booking Service (`booking-group`) |
| Khi nào    | Event bị huỷ bởi Organizer hoặc Admin                                          |

```typescript
payload: {
  eventId: string;
  organizerId: string;
  title: string;
  startAt: string;
  bookedUserEmails: {
    userId: string;
    email: string;
    fullName: string;
  }
  [];
}
```

Notification Service xử lý: gửi email thông báo huỷ đến từng user đã đặt vé + lưu notification.

Booking Service xử lý: cập nhật tất cả booking của event → `CANCELLED`, hoàn slot về Event Service.

---

### `booking.confirmed`

| Thuộc tính | Giá trị                                     |
| ---------- | ------------------------------------------- |
| Publisher  | Booking Service                             |
| Consumer   | Notification Service (`notification-group`) |
| Khi nào    | Đặt vé thành công                           |

```typescript
payload: {
  bookingId: string;
  userId: string;
  email: string;
  fullName: string;
  eventTitle: string;
  ticketTypeName: string;
  zone: string;
  quantity: number;
  totalAmount: number;
  startAt: string;
  venueName: string;
  tickets: {
    ticketId: string; // dùng để generate QR on-the-fly
  }
  [];
}
```

Notification Service xử lý:

- Gửi email xác nhận kèm QR (1 email/ticket)
- Emit Socket `booking_confirmed` về đúng user
- Emit Socket `slot_updated` về tất cả user đang xem event
- Lưu notification

---

### `booking.failed`

| Thuộc tính | Giá trị                                          |
| ---------- | ------------------------------------------------ |
| Publisher  | Booking Service                                  |
| Consumer   | Notification Service (`notification-group`)      |
| Khi nào    | Đặt vé thất bại (hết slot, lock fail, lỗi DB...) |

```typescript
payload: {
  userId: string;
  email: string;
  fullName: string;
  eventTitle: string;
  reason: string; // "Hết vé", "Đã có người đặt", "Lỗi hệ thống"
}
```

Notification Service xử lý:

- Gửi email thông báo thất bại
- Emit Socket `booking_failed` về đúng user
- Lưu notification

---

## Tổng hợp

### Publisher map

| Service              | Publish topics                                                    |
| -------------------- | ----------------------------------------------------------------- |
| User Service         | `user.registered`, `user.organizer_approved`, `notification.send` |
| Event Service        | `event.created`, `event.cancelled`                                |
| Booking Service      | `booking.confirmed`, `booking.failed`                             |
| Notification Service | Không publish                                                     |

### Consumer map

| Service              | Consumer group       | Subscribe topics                                                                                                            |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Notification Service | `notification-group` | `user.registered`, `user.organizer_approved`, `notification.send`, `event.cancelled`, `booking.confirmed`, `booking.failed` |
| Booking Service      | `booking-group`      | `event.cancelled`                                                                                                           |
| User Service         | Không consume        | —                                                                                                                           |
| Event Service        | Không consume        | —                                                                                                                           |

### Topic × Consumer matrix

| Topic                     | notification-group | booking-group |
| ------------------------- | ------------------ | ------------- |
| `user.registered`         | ✓                  | —             |
| `user.organizer_approved` | ✓                  | —             |
| `notification.send`       | ✓                  | —             |
| `event.created`           | —                  | —             |
| `event.cancelled`         | ✓                  | ✓             |
| `booking.confirmed`       | ✓                  | —             |
| `booking.failed`          | ✓                  | —             |

---

## Implementation Rules

- Mỗi topic có **1 partition** — đủ cho scope hiện tại, scale sau bằng cách tăng partition
- Consumer group phải khai báo để Kafka lưu offset — service restart không mất message
- Mỗi consumer handler phải **idempotent** — cùng 1 message xử lý nhiều lần không gây ra side effect
- Lỗi xử lý 1 message không được làm crash toàn bộ consumer — bắt lỗi từng message riêng
- Topic `event.created` khai báo sẵn dù chưa có consumer — không ảnh hưởng gì, Kafka không quan tâm
- Payload phải đủ thông tin để consumer xử lý độc lập, không cần gọi thêm API khác nếu có thể
