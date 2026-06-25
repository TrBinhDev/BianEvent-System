# BianEvent System — Frontend Context Document

> Tài liệu này dành cho việc xây dựng Frontend của hệ thống BianEvent.
> Backend đã hoàn chỉnh, chỉ cần gọi API theo đúng spec dưới đây.

---

## Tech Stack Frontend

```
Framework:    Next.js 14 (App Router)
Language:     TypeScript
Styling:      Tailwind CSS
HTTP Client:  Axios
State:        Zustand
Form:         React Hook Form + Zod
UI Components: Shadcn/ui
Realtime:     Socket.io Client
QR Code:      qrcode.react
Date:         date-fns
Toast:        react-hot-toast
```

---

## Kiến trúc tổng quan

```
apps/
├── web/          # Trang public cho User :4000
└── dashboard/    # Trang Organizer + Admin :4001

API Gateway:      http://localhost:3000  (tất cả request đều qua đây)
Socket.io:        http://localhost:3004  (Notification Service, kết nối trực tiếp)
```

---

## Auth Strategy

```
Access Token:  Lưu trong memory (Zustand store), TTL 15 phút
Refresh Token: Lưu trong HttpOnly cookie (tự động set bởi server)
```

Mỗi request cần header:

```
Authorization: Bearer {accessToken}
```

Khi access token hết hạn (401) → gọi `POST /api/auth/refresh` → lấy token mới → retry request.

---

## Roles

```
USER       — người dùng thường
ORGANIZER  — người tổ chức event
ADMIN      — quản trị viên
```

JWT payload: `{ sub: userId, role, iat, exp }`

---

## Lưu ý quan trọng

- **Payment chưa implement** — booking confirm ngay sau khi đặt, không có bước thanh toán
- **OTP verify** — sau register phải verify email bằng OTP 6 số gửi qua email
- **Upload file** — dùng `multipart/form-data`, field name là `file` (single) hoặc `files` (multiple)
- **Pagination** — tất cả API list đều có `page`, `limit`, trả về `pagination` object
- **Response format** — tất cả response đều có `success: boolean`

---

## ==========================================

## WEB APP (port 4000) — Trang public cho User

## ==========================================

---

## 1. AUTH

### POST /api/auth/register

**Body:**

```json
{
  "email": "user@gmail.com",
  "password": "12345678",
  "fullName": "Nguyen Van A"
}
```

**Response 201:**

```json
{
  "success": true,
  "userId": "uuid",
  "message": "Đăng ký thành công, vui lòng kiểm tra email để xác thực"
}
```

---

### POST /api/auth/verify-email

**Body:**

```json
{
  "userId": "uuid",
  "otp": "123456"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Xác thực email thành công"
}
```

---

### POST /api/auth/resend-otp

**Body:**

```json
{
  "userId": "uuid"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đã gửi lại OTP, vui lòng kiểm tra email"
}
```

> Rate limit: 1 lần/phút, nếu vượt trả về 429

---

### POST /api/auth/login

**Body:**

```json
{
  "email": "user@gmail.com",
  "password": "12345678"
}
```

**Response 200:**

```json
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
```

> Refresh token tự động set vào HttpOnly cookie

---

### POST /api/auth/logout

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### POST /api/auth/refresh

> Không cần body, server đọc refresh token từ cookie
> **Response 200:**

```json
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
```

---

### POST /api/auth/forgot-password

**Body:**

```json
{
  "email": "user@gmail.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu"
}
```

---

### POST /api/auth/reset-password

**Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 2. PROFILE

### GET /api/users/me

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "fullName": "Nguyen Van A",
    "avatarUrl": null,
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-06-25T00:00:00.000Z"
  }
}
```

---

### PATCH /api/users/me

**Header:** `Authorization: Bearer {accessToken}`
**Body:**

```json
{
  "fullName": "Nguyen Van B",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "fullName": "Nguyen Van B",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "USER"
  }
}
```

---

### PATCH /api/users/me/password

**Header:** `Authorization: Bearer {accessToken}`
**Body:**

```json
{
  "oldPassword": "12345678",
  "newPassword": "newpassword123"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### POST /api/users/me/apply-organizer

**Header:** `Authorization: Bearer {accessToken}` (role: USER)
**Body:**

```json
{
  "organization": "Cong ty To Chuc Su Kien ABC",
  "description": "Chuyen to chuc cac su kien am nhac",
  "contactPhone": "0901234567"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đã gửi đơn đăng ký Organizer, vui lòng chờ duyệt"
}
```

> Nếu đã có đơn PENDING: trả về lỗi 400
> Nếu đơn bị REJECTED: cho apply lại

---

## 3. EVENTS (Public — không cần auth)

### GET /api/events

**Query params:**

```
page=1&limit=10&city=Hà Nội&categoryId=uuid&search=concert&date=2026-08-15
```

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizerId": "uuid",
      "categoryId": "uuid",
      "title": "Đêm nhạc mùa hè 2026",
      "description": "Mô tả event",
      "coverUrl": "https://r2.bian.io.vn/covers/xxx.jpg",
      "seatingMapUrl": null,
      "status": "PUBLISHED",
      "venueName": "Nhà hát lớn Hà Nội",
      "address": "1 Tràng Tiền, Hoàn Kiếm",
      "city": "Hà Nội",
      "lat": null,
      "lng": null,
      "startAt": "2026-08-15T19:00:00.000Z",
      "endAt": "2026-08-15T22:00:00.000Z",
      "saleStartAt": "2026-07-01T00:00:00.000Z",
      "saleEndAt": "2026-08-14T23:59:59.000Z",
      "createdAt": "2026-06-25T00:00:00.000Z",
      "updatedAt": "2026-06-25T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Âm nhạc",
        "slug": "am-nhac"
      },
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "VIP",
          "price": "500000",
          "availableSlots": 45,
          "zone": "Khu A - Hàng ghế 1-10"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### GET /api/events/categories

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Âm nhạc",
      "slug": "am-nhac",
      "createdAt": "2026-06-25T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/events/:id

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Đêm nhạc mùa hè 2026",
    "description": "Mô tả chi tiết event",
    "coverUrl": "https://r2.bian.io.vn/covers/xxx.jpg",
    "seatingMapUrl": "https://r2.bian.io.vn/seating-maps/xxx.jpg",
    "status": "PUBLISHED",
    "venueName": "Nhà hát lớn Hà Nội",
    "address": "1 Tràng Tiền, Hoàn Kiếm",
    "city": "Hà Nội",
    "lat": null,
    "lng": null,
    "startAt": "2026-08-15T19:00:00.000Z",
    "endAt": "2026-08-15T22:00:00.000Z",
    "saleStartAt": "2026-07-01T00:00:00.000Z",
    "saleEndAt": "2026-08-14T23:59:59.000Z",
    "category": {
      "id": "uuid",
      "name": "Âm nhạc",
      "slug": "am-nhac"
    },
    "images": [
      {
        "id": "uuid",
        "url": "https://r2.bian.io.vn/events/xxx.jpg",
        "order": 0
      }
    ],
    "ticketTypes": [
      {
        "id": "uuid",
        "name": "VIP",
        "description": "Ghế hàng đầu, view tốt nhất",
        "price": "500000",
        "totalSlots": 50,
        "availableSlots": 45,
        "zone": "Khu A - Hàng ghế 1-10"
      },
      {
        "id": "uuid",
        "name": "Standard",
        "description": null,
        "price": "200000",
        "totalSlots": 200,
        "availableSlots": 180,
        "zone": "Khu B - Hàng ghế 11-30"
      }
    ]
  }
}
```

---

## 4. BOOKINGS

### POST /api/bookings

**Header:** `Authorization: Bearer {accessToken}` (role: USER)
**Body:**

```json
{
  "ticketTypeId": "uuid",
  "quantity": 2
}
```

**Response 201:**

```json
{
  "success": true,
  "bookingId": "uuid",
  "message": "Đặt vé thành công"
}
```

> Quantity tối đa 4 mỗi lần
> Tổng vé 1 user cho 1 event tối đa 4
> Sau khi đặt thành công: email QR gửi về mail, socket emit `booking_confirmed`

---

### GET /api/bookings/my

**Header:** `Authorization: Bearer {accessToken}`
**Query:** `page=1&limit=10&status=CONFIRMED`
**Status values:** `PENDING | CONFIRMED | FAILED | CANCELLED`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "eventId": "uuid",
      "ticketTypeId": "uuid",
      "quantity": 2,
      "totalAmount": "1000000",
      "status": "CONFIRMED",
      "paymentStatus": "UNPAID",
      "createdAt": "2026-06-25T00:00:00.000Z",
      "updatedAt": "2026-06-25T00:00:00.000Z",
      "tickets": [
        { "id": "uuid", "status": "ACTIVE" },
        { "id": "uuid", "status": "ACTIVE" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### GET /api/bookings/my/:id

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "eventId": "uuid",
    "ticketTypeId": "uuid",
    "quantity": 2,
    "totalAmount": "1000000",
    "status": "CONFIRMED",
    "paymentStatus": "UNPAID",
    "createdAt": "2026-06-25T00:00:00.000Z",
    "tickets": [
      { "id": "uuid", "status": "ACTIVE", "createdAt": "..." },
      { "id": "uuid", "status": "ACTIVE", "createdAt": "..." }
    ],
    "statusLogs": [
      {
        "id": "uuid",
        "fromStatus": null,
        "toStatus": "CONFIRMED",
        "reason": "Đặt vé thành công",
        "createdAt": "2026-06-25T00:00:00.000Z"
      }
    ]
  }
}
```

> QR Code generate on-the-fly từ `ticket.id` bằng thư viện `qrcode.react` ở FE
> Không cần gọi API riêng để lấy QR

---

## 5. NOTIFICATIONS

### GET /api/notifications

**Header:** `Authorization: Bearer {accessToken}`
**Query:** `page=1&limit=10&isRead=false`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Đặt vé thành công",
      "body": "Bạn đã đặt thành công 2 vé cho sự kiện \"Đêm nhạc mùa hè 2026\".",
      "type": "BOOKING_CONFIRMED",
      "isRead": false,
      "createdAt": "2026-06-25T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Notification types:** `BOOKING_CONFIRMED | BOOKING_FAILED | EVENT_CANCELLED | ORGANIZER_APPROVED`

---

### GET /api/notifications/unread-count

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "count": 3
}
```

---

### PATCH /api/notifications/:id/read

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "message": "Đã đánh dấu đã đọc"
}
```

---

### PATCH /api/notifications/read-all

**Header:** `Authorization: Bearer {accessToken}`
**Response 200:**

```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả đã đọc"
}
```

---

## 6. SOCKET.IO (Web App)

**Kết nối:**

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3004", {
  withCredentials: true,
});

// Join room user sau khi login
socket.emit("join:user", userId);

// Join room event khi vào trang chi tiết event
socket.emit("join:event", eventId);

// Leave room event khi rời trang
socket.emit("leave:event", eventId);
```

**Events lắng nghe:**

```typescript
// Đặt vé thành công
socket.on("booking_confirmed", (data) => {
  // data: { bookingId, eventTitle, quantity }
  // Hiển thị toast thành công
});

// Đặt vé thất bại
socket.on("booking_failed", (data) => {
  // data: { eventTitle, reason }
  // Hiển thị toast lỗi
});

// Slot vé cập nhật realtime (khi đang xem trang chi tiết event)
socket.on("slot_updated", (data) => {
  // data: { eventId, eventTitle }
  // Re-fetch event detail để cập nhật số slot còn lại
});

// Thông báo mới
socket.on("new_notification", (data) => {
  // data: { title, body, type }
  // Tăng unread count badge lên 1
  // Hiển thị toast thông báo
});
```

---

## ==========================================

## DASHBOARD (port 4001) — Organizer + Admin

## ==========================================

---

## 7. ORGANIZER — EVENTS

### GET /api/organizer/events

**Header:** `Authorization: Bearer {accessToken}` (role: ORGANIZER)
**Query:** `status=DRAFT|PUBLISHED|CANCELLED`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Đêm nhạc mùa hè 2026",
      "status": "DRAFT",
      "city": "Hà Nội",
      "startAt": "2026-08-15T19:00:00.000Z",
      "coverUrl": null,
      "category": { "id": "uuid", "name": "Âm nhạc" },
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "VIP",
          "price": "500000",
          "totalSlots": 50,
          "availableSlots": 50
        }
      ]
    }
  ]
}
```

---

### POST /api/organizer/events

**Header:** `Authorization: Bearer {accessToken}` (role: ORGANIZER)
**Body:**

```json
{
  "title": "Đêm nhạc mùa hè 2026",
  "description": "Mô tả event",
  "categoryId": "uuid",
  "venueName": "Nhà hát lớn Hà Nội",
  "address": "1 Tràng Tiền, Hoàn Kiếm",
  "city": "Hà Nội",
  "lat": null,
  "lng": null,
  "startAt": "2026-08-15T19:00:00.000Z",
  "endAt": "2026-08-15T22:00:00.000Z",
  "saleStartAt": "2026-07-01T00:00:00.000Z",
  "saleEndAt": "2026-08-14T23:59:59.000Z"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Đêm nhạc mùa hè 2026",
    "status": "DRAFT",
    ...
  }
}
```

---

### GET /api/organizer/events/:id

**Response 200:** Trả về full event kèm `images`, `ticketTypes`

---

### PATCH /api/organizer/events/:id

**Body:** Bất kỳ field nào của event (partial update)
**Response 200:** Trả về event đã update

---

### PATCH /api/organizer/events/:id/status

**Body:**

```json
{ "status": "PUBLISHED" }
```

hoặc

```json
{ "status": "CANCELLED" }
```

> DRAFT → PUBLISHED: publish Kafka `event.created`
> PUBLISHED → CANCELLED: publish Kafka `event.cancelled` → email toàn bộ user đã đặt vé
> CANCELLED không thể đổi lại

---

### DELETE /api/organizer/events/:id

> Chỉ xoá được khi status là DRAFT

---

### POST /api/organizer/events/:id/cover

**Header:** `Content-Type: multipart/form-data`
**Body:** field name = `file`, 1 file ảnh
**Response 200:**

```json
{
  "success": true,
  "coverUrl": "https://r2.bian.io.vn/covers/xxx.jpg"
}
```

---

### POST /api/organizer/events/:id/images

**Header:** `Content-Type: multipart/form-data`
**Body:** field name = `files`, tối đa 10 file
**Response 200:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công"
}
```

---

### DELETE /api/organizer/events/:id/images/:imageId

**Response 200:**

```json
{
  "success": true,
  "message": "Xoá ảnh thành công"
}
```

---

### POST /api/organizer/events/:id/seating-map

**Header:** `Content-Type: multipart/form-data`
**Body:** field name = `file`, 1 file ảnh sơ đồ chỗ ngồi
**Response 200:**

```json
{
  "success": true,
  "seatingMapUrl": "https://r2.bian.io.vn/seating-maps/xxx.jpg"
}
```

---

### GET /api/organizer/events/:id/stats

**Response 200:**

```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "title": "Đêm nhạc mùa hè 2026",
    "totalRevenue": 5000000,
    "ticketTypes": [
      {
        "ticketTypeId": "uuid",
        "name": "VIP",
        "totalSlots": 50,
        "availableSlots": 45,
        "soldSlots": 5,
        "revenue": 2500000
      },
      {
        "ticketTypeId": "uuid",
        "name": "Standard",
        "totalSlots": 200,
        "availableSlots": 175,
        "soldSlots": 25,
        "revenue": 5000000
      }
    ]
  }
}
```

---

## 8. ORGANIZER — TICKET TYPES

### PATCH /api/bookings/tickets/:ticketId/checkin

**Header:** `Authorization: Bearer {accessToken}` (role: ORGANIZER)
**Response 200:**
\```json
{
"success": true,
"message": "Check-in thành công"
}
\```
**Error cases:**

- 400: "Vé đã được sử dụng"
- 400: "Vé đã bị huỷ"
- 403: "Bạn không có quyền check-in vé này"
- 404: "Vé không tồn tại"

### POST /api/organizer/events/:id/ticket-types

**Body:**

```json
{
  "name": "VIP",
  "description": "Ghế hàng đầu, view tốt nhất",
  "price": 500000,
  "totalSlots": 50,
  "zone": "Khu A - Hàng ghế 1-10"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "name": "VIP",
    "description": "Ghế hàng đầu, view tốt nhất",
    "price": "500000",
    "totalSlots": 50,
    "availableSlots": 50,
    "zone": "Khu A - Hàng ghế 1-10",
    "createdAt": "2026-06-25T00:00:00.000Z"
  }
}
```

---

### PATCH /api/organizer/events/:id/ticket-types/:typeId

**Body:** Bất kỳ field nào (partial update) — có thể sửa giá, slot kể cả sau PUBLISHED

---

### DELETE /api/organizer/events/:id/ticket-types/:typeId

> Chỉ xoá được nếu chưa có ai đặt (`availableSlots === totalSlots`)

---

## 9. ADMIN — USERS

### GET /api/admin/users

**Header:** `Authorization: Bearer {accessToken}` (role: ADMIN)
**Query:** `page=1&limit=10&role=USER&status=ACTIVE`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@gmail.com",
      "fullName": "Nguyen Van A",
      "avatarUrl": null,
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2026-06-25T00:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

---

### GET /api/admin/users/:id

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "fullName": "Nguyen Van A",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "...",
    "organizerApplication": {
      "id": "uuid",
      "organization": "Cong ty ABC",
      "description": "Mo ta",
      "contactPhone": "0901234567",
      "status": "PENDING",
      "createdAt": "..."
    }
  }
}
```

---

### PATCH /api/admin/users/:id/role

**Body:**

```json
{ "role": "ORGANIZER" }
```

> role values: `USER | ORGANIZER | ADMIN`

---

### PATCH /api/admin/users/:id/status

**Body:**

```json
{ "status": "BANNED" }
```

> status values: `ACTIVE | BANNED`
> Ban: xoá refresh token, lưu Redis `banned:{userId}` → mọi request trả 403

---

### GET /api/admin/organizer-applications

**Query:** `page=1&limit=10&status=PENDING`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "organization": "Cong ty ABC",
      "description": "Mo ta",
      "contactPhone": "0901234567",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewedAt": null,
      "createdAt": "...",
      "user": {
        "id": "uuid",
        "email": "user@gmail.com",
        "fullName": "Nguyen Van A"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

---

### PATCH /api/admin/organizer-applications/:id/approve

> Duyệt đơn → role user chuyển ORGANIZER → email thông báo → Kafka `user.organizer_approved`
> **Response 200:**

```json
{
  "success": true,
  "message": "Đã duyệt đơn Organizer"
}
```

---

### PATCH /api/admin/organizer-applications/:id/reject

**Response 200:**

```json
{
  "success": true,
  "message": "Đã từ chối đơn Organizer"
}
```

---

## 10. ADMIN — EVENTS

### GET /api/admin/events

**Query:** `page=1&limit=10&status=PUBLISHED`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Đêm nhạc mùa hè 2026",
      "status": "PUBLISHED",
      "organizerId": "uuid",
      "city": "Hà Nội",
      "startAt": "2026-08-15T19:00:00.000Z",
      "category": { "id": "uuid", "name": "Âm nhạc" },
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "VIP",
          "totalSlots": 50,
          "availableSlots": 45
        }
      ]
    }
  ]
}
```

---

### PATCH /api/admin/events/:id/status

**Body:**

```json
{ "status": "CANCELLED" }
```

> Admin có thể force cancel event vi phạm

---

## 11. ADMIN — CATEGORIES

### GET /api/admin/categories

**Response 200:**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Âm nhạc", "slug": "am-nhac", "createdAt": "..." }
  ]
}
```

---

### POST /api/admin/categories

**Body:**

```json
{ "name": "Âm nhạc" }
```

> slug tự động generate từ name

---

### PATCH /api/admin/categories/:id

**Body:**

```json
{ "name": "Âm nhạc & Giải trí" }
```

---

### DELETE /api/admin/categories/:id

> Không xoá được nếu có event đang dùng category này

---

## 12. ADMIN — BOOKINGS

### GET /api/admin/bookings

**Query:** `page=1&limit=10&status=CONFIRMED&eventId=uuid`
**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "eventId": "uuid",
      "ticketTypeId": "uuid",
      "quantity": 2,
      "totalAmount": "1000000",
      "status": "CONFIRMED",
      "paymentStatus": "UNPAID",
      "createdAt": "...",
      "tickets": [{ "id": "uuid", "status": "ACTIVE" }],
      "statusLogs": [
        {
          "id": "uuid",
          "fromStatus": null,
          "toStatus": "CONFIRMED",
          "reason": "Đặt vé thành công",
          "createdAt": "..."
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

### GET /api/admin/bookings/:id

> Trả về chi tiết 1 booking kèm `tickets` và `statusLogs`

---

## 13. ERROR RESPONSES

**400 Bad Request:**

```json
{ "success": false, "message": "Email đã được sử dụng" }
```

**401 Unauthorized:**

```json
{ "success": false, "message": "Vui lòng đăng nhập" }
```

**403 Forbidden:**

```json
{ "success": false, "message": "Bạn không có quyền thực hiện hành động này" }
```

**404 Not Found:**

```json
{ "success": false, "message": "Event không tồn tại" }
```

**409 Conflict:**

```json
{ "success": false, "message": "Vé đang được xử lý, vui lòng thử lại" }
```

**429 Too Many Requests:**

```json
{ "success": false, "message": "Quá nhiều yêu cầu, vui lòng thử lại sau" }
```

**500 Server Error:**

```json
{ "success": false, "message": "Lỗi hệ thống, vui lòng thử lại sau" }
```

---

## 14. LƯU Ý ĐẶC BIỆT

**QR Code:**

- Không có API riêng để lấy QR
- Generate on-the-fly ở FE bằng `qrcode.react`
- Value của QR = `ticketId` (UUID)
- Email đã có QR sẵn gửi kèm từ Notification Service

**Realtime slot:**

- Khi user đang xem trang chi tiết event, join socket room `event:{eventId}`
- Khi có người đặt vé thành công → server emit `slot_updated`
- FE nhận event này → re-fetch `GET /api/events/:id` để cập nhật số slot

**Payment:**

- Chưa implement
- Booking confirm ngay sau khi đặt
- `paymentStatus` luôn là `UNPAID`
- Field này để sẵn cho sau này thêm Payment Service

**Axios interceptor:**

```typescript
// Tự động refresh token khi 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { data } = await axios.post("/api/auth/refresh");
      // lưu token mới vào store
      // retry request
    }
    return Promise.reject(error);
  },
);
```

**Upload file:**

```typescript
const formData = new FormData();
formData.append("file", file); // single
formData.append("files", file1); // multiple
formData.append("files", file2);

await axios.post("/api/organizer/events/:id/cover", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```
