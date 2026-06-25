# User Service — Phân tích chi tiết

## Tổng quan

| Thuộc tính       | Giá trị                                              |
| ---------------- | ---------------------------------------------------- |
| Port             | `:3001`                                              |
| Database         | PostgreSQL — `db_users` (Database-per-Service)       |
| Cache            | Redis — OTP, refresh token                           |
| Kafka            | Publish `user.registered`, `user.organizer_approved` |
| Giao tiếp nội bộ | Internal REST API cho các service khác               |

---

## Roles

```
USER       — người dùng thường, mua vé xem sự kiện
ORGANIZER  — người tổ chức, tạo và quản lý event
ADMIN      — quản trị viên hệ thống
```

## User Status

```
UNVERIFIED  — mới đăng ký, chưa xác thực email
ACTIVE      — đã xác thực, hoạt động bình thường
BANNED      — bị admin khoá tài khoản
```

---

## Database Schema

### Bảng `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  avatar_url    VARCHAR(500),
  role          ENUM('USER', 'ORGANIZER', 'ADMIN') DEFAULT 'USER',
  status        ENUM('UNVERIFIED', 'ACTIVE', 'BANNED') DEFAULT 'UNVERIFIED',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### Bảng `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Bảng `password_resets`

```sql
CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Bảng `organizer_applications`

```sql
CREATE TABLE organizer_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  organization     VARCHAR(255) NOT NULL,
  description      TEXT,
  contact_phone    VARCHAR(20),
  status           ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  reviewed_by      UUID REFERENCES users(id),
  reviewed_at      TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

### Redis Keys

```
otp:{userId}                — OTP xác thực email, TTL: 10 phút
otp_rate:{userId}           — rate limit resend OTP, TTL: 1 phút
refresh_token:{userId}      — danh sách refresh token hợp lệ (bỏ lưu thẳng vào database)
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint                | Role          | Mô tả                                                 |
| ------ | ----------------------- | ------------- | ----------------------------------------------------- |
| POST   | `/auth/register`        | Public        | Đăng ký tài khoản, status mặc định `UNVERIFIED`       |
| POST   | `/auth/verify-email`    | Public        | Xác thực email bằng OTP 6 số                          |
| POST   | `/auth/resend-otp`      | Public        | Gửi lại OTP (rate limit: 1 lần/phút)                  |
| POST   | `/auth/login`           | Public        | Đăng nhập, chặn nếu status `UNVERIFIED` hoặc `BANNED` |
| POST   | `/auth/logout`          | Authenticated | Revoke refresh token hiện tại                         |
| POST   | `/auth/refresh`         | Public        | Dùng refresh token lấy access token mới               |
| POST   | `/auth/forgot-password` | Public        | Publish Kafka → Notification gửi email reset          |
| POST   | `/auth/reset-password`  | Public        | Đặt lại mật khẩu bằng token từ email                  |

### Profile — `/api/users`

| Method | Endpoint                    | Role          | Mô tả                               |
| ------ | --------------------------- | ------------- | ----------------------------------- |
| GET    | `/users/me`                 | Authenticated | Xem thông tin profile bản thân      |
| PATCH  | `/users/me`                 | Authenticated | Cập nhật `full_name`, `avatar_url`  |
| PATCH  | `/users/me/password`        | Authenticated | Đổi mật khẩu (cần nhập mật khẩu cũ) |
| POST   | `/users/me/apply-organizer` | USER          | Nộp đơn đăng ký làm Organizer       |

### Admin — `/api/admin`

| Method | Endpoint                                    | Role  | Mô tả                                               |
| ------ | ------------------------------------------- | ----- | --------------------------------------------------- |
| GET    | `/admin/users`                              | ADMIN | Danh sách user, filter theo role/status, pagination |
| GET    | `/admin/users/:id`                          | ADMIN | Xem chi tiết 1 user                                 |
| PATCH  | `/admin/users/:id/role`                     | ADMIN | Đổi role thủ công                                   |
| PATCH  | `/admin/users/:id/status`                   | ADMIN | Ban / unban tài khoản                               |
| GET    | `/admin/organizer-applications`             | ADMIN | Danh sách đơn đăng ký Organizer                     |
| PATCH  | `/admin/organizer-applications/:id/approve` | ADMIN | Duyệt → role chuyển ORGANIZER, publish Kafka        |
| PATCH  | `/admin/organizer-applications/:id/reject`  | ADMIN | Từ chối đơn                                         |

### Internal — `/internal`

> Không expose qua API Gateway, chỉ gọi service-to-service trong Docker network

| Method | Endpoint                       | Caller                        | Mô tả                                     |
| ------ | ------------------------------ | ----------------------------- | ----------------------------------------- |
| GET    | `/internal/users/:id`          | Booking, Notification Service | Lấy `email`, `full_name` để gửi thông báo |
| POST   | `/internal/users/verify-token` | API Gateway                   | Xác thực JWT, trả về `userId` + `role`    |

---

**Tổng: 21 API** (8 auth + 4 profile + 7 admin + 2 internal)

---

## JWT Strategy

```
Access Token  — TTL: 15 phút, lưu trong memory phía client
Refresh Token — TTL: 7 ngày, lưu trong HttpOnly cookie
```

- Access token payload: `{ sub: userId, role, iat, exp }`
- Refresh token: hash bằng SHA-256 trước khi lưu DB (không lưu raw)
- Khi logout: xoá refresh token khỏi DB
- Khi refresh: kiểm tra token còn trong DB và chưa hết hạn → issue access token mới

---

## Kafka

### Publish

| Topic                     | Khi nào                     | Payload                                               |
| ------------------------- | --------------------------- | ----------------------------------------------------- |
| `user.registered`         | Sau khi register thành công | `{ userId, email, fullName, otp }`                    |
| `user.organizer_approved` | Admin duyệt đơn Organizer   | `{ userId, email, fullName }`                         |
| `notification.send`       | Forgot password             | `{ to, type: 'RESET_PASSWORD', data: { resetLink } }` |

> Notification Service consume tất cả các topic trên để gửi email tương ứng

---

## Flows quan trọng

### Register + OTP verify

```
POST /auth/register
  → Tạo user, status: UNVERIFIED
  → Sinh OTP 6 số, lưu Redis key otp:{userId}, TTL 10 phút
  → Publish Kafka: user.registered (kèm OTP)
  → Notification Service gửi email OTP

POST /auth/verify-email { otp }
  → Kiểm tra Redis otp:{userId}
  → Đúng → status: ACTIVE, xoá key Redis
  → Sai / hết hạn → trả lỗi 400

POST /auth/resend-otp
  → Kiểm tra Redis otp_rate:{userId} (rate limit)
  → Nếu chưa bị limit → sinh OTP mới, publish Kafka lại
```

### Apply Organizer

```
POST /users/me/apply-organizer
  → Tạo record organizer_applications, status: PENDING

PATCH /admin/organizer-applications/:id/approve
  → Cập nhật application status: APPROVED
  → Cập nhật users.role: ORGANIZER
  → Publish Kafka: user.organizer_approved
  → Notification Service gửi email thông báo
```

### Forgot Password

```
POST /auth/forgot-password { email }
  → Sinh reset token, hash SHA-256, lưu bảng password_resets, TTL 10 phút
  → Publish Kafka: notification.send (type: RESET_PASSWORD)
  → Notification Service gửi email chứa reset link

POST /auth/reset-password { token, newPassword }
  → Kiểm tra token hash trong DB, còn hạn và chưa used
  → Cập nhật password_hash, đánh dấu used: true
```

---

## Cấu trúc thư mục Service

```
services/user-service/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.dto.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.dto.ts
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
│   ├── utils/
│   │   ├── hash.ts
│   │   ├── token.ts
│   │   └── otp.ts
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
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db_users

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=user-service

# Internal
INTERNAL_API_KEY=your_internal_secret
```

---

## Notes

- OTP 6 số, TTL 10 phút, lưu Redis — tự xoá sau khi hết hạn, không cần cronjob
- Password reset token TTL 10 phút, dùng 1 lần rồi đánh dấu `used: true`
- Internal endpoints bảo vệ bằng `x-internal-key` header, không dùng JWT
- Avatar chỉ lưu `avatar_url` string — upload R2 thật thêm sau
- Organizer không thể tự đổi role — phải qua flow apply → Admin duyệt
- User Service không dùng Socket.io — thuần REST API

---

## Ban Flow

Khi Admin ban user:

```
PATCH /admin/users/:id/status { status: BANNED }
  → Cập nhật DB users.status = BANNED
  → Lưu Redis: banned:{userId} = true (TTL không giới hạn)
  → Xoá toàn bộ refresh_tokens của user đó trong DB
```

Khi user gọi API sau khi bị ban:

```
Request → Gateway → forward đến /internal/users/verify-token
  → User Service verify JWT
  → Check Redis banned:{userId} → có → trả 403
  → Gateway nhận 403 → trả về client
```

Khi user bị ban cố login lại:

```
POST /auth/login
  → User Service check DB users.status = BANNED → trả 403 luôn
  → Không issue token mới
```

> Gateway không tự đọc Redis của User Service — chỉ forward token verify request.
> Mỗi service sở hữu data của mình, Gateway chỉ làm nhiệm vụ routing.

---

## Implementation Rules

> Các rule bắt buộc khi implement service này

**Kiến trúc:**

- Gateway không được trực tiếp query Redis hoặc DB của User Service
- Gateway chỉ forward request xác thực đến `/internal/users/verify-token`
- Internal endpoints (`/internal/*`) chỉ accessible trong Docker network, không expose ra ngoài
- Bảo vệ internal endpoints bằng `x-internal-key` header, không dùng JWT

**Database:**

- Refresh token phải hash SHA-256 trước khi lưu DB, không lưu raw token
- Password phải hash bằng bcrypt (rounds: 12) trước khi lưu
- Password reset token phải hash SHA-256, đánh dấu `used: true` sau khi dùng
- Mỗi lần refresh token phải xoá token cũ, issue token mới (rotation)

**Redis:**

- OTP lưu key `otp:{userId}`, TTL 10 phút
- Rate limit resend OTP lưu key `otp_rate:{userId}`, TTL 1 phút
- Ban user lưu key `banned:{userId}`, không TTL
- Khi unban phải xoá key `banned:{userId}` khỏi Redis

**Business rules:**

- User status `UNVERIFIED` không được login
- User status `BANNED` không được login, mọi request đang active trả 403
- Organizer phải qua flow apply → Admin duyệt, không tự đổi role được
- Chỉ ADMIN mới được đổi role, ban/unban tài khoản
- Forgot password đi qua Kafka → Notification Service gửi email, User Service không tự gửi email trực tiếp
