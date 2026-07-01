# BianEvent System

Nền tảng mua bán vé sự kiện được xây dựng theo kiến trúc microservice.

## Tech Stack

| Layer           | Tech                           |
| --------------- | ------------------------------ |
| Backend         | Node.js + Express + TypeScript |
| Frontend        | Next.js 14 (App Router)        |
| ORM             | Prisma                         |
| Validation      | Zod                            |
| Message Broker  | Apache Kafka                   |
| Cache           | Redis                          |
| Database        | PostgreSQL                     |
| Email           | Resend + React Email           |
| Realtime        | Socket.io                      |
| Storage         | Cloudflare R2                  |
| Package Manager | pnpm workspaces                |

---

## Kiến trúc hệ thống

```
Client (Next.js)
      ↓
API Gateway :3000
      ↓
┌─────────────────────────────────────────┐
│  User Service    :3001                  │
│  Event Service   :3002                  │
│  Booking Service :3003                  │
│  Notification    :3004                  │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  PostgreSQL (×4 DB)                     │
│  Redis                                  │
│  Apache Kafka                           │
│  Cloudflare R2                          │
└─────────────────────────────────────────┘
```

---

## Cấu trúc thư mục

```
BianEvent-System/
├── apps/
│   ├── web/                # Next.js — trang public cho User :4000
│   └── dashboard/          # Next.js — trang Organizer + Admin :4001
├── services/
│   ├── gateway/            # API Gateway :3000
│   ├── user-service/       # User Service :3001
│   ├── event-service/      # Event Service :3002
│   ├── booking-service/    # Booking Service :3003
│   └── notification-service/ # Notification Service :3004
├── packages/
│   ├── types/              # TypeScript types dùng chung
│   ├── kafka/              # Kafka client dùng chung
│   └── utils/              # Utilities dùng chung
├── docker/
│   └── postgres/
│       └── init.sql
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

## Roles

| Role        | Mô tả                                 |
| ----------- | ------------------------------------- |
| `USER`      | Người dùng thường, mua vé xem sự kiện |
| `ORGANIZER` | Người tổ chức, tạo và quản lý event   |
| `ADMIN`     | Quản trị viên hệ thống                |

---

## Kafka Topics

| Topic                     | Publisher       | Consumer                              |
| ------------------------- | --------------- | ------------------------------------- |
| `user.registered`         | User Service    | Notification Service                  |
| `user.organizer_approved` | User Service    | Notification Service                  |
| `notification.send`       | User Service    | Notification Service                  |
| `event.created`           | Event Service   | —                                     |
| `event.cancelled`         | Event Service   | Notification Service, Booking Service |
| `booking.confirmed`       | Booking Service | Notification Service                  |
| `booking.failed`          | Booking Service | Notification Service                  |

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- pnpm >= 8
- Docker Desktop

### 1. Clone repo

```bash
git clone https://github.com/your-username/BianEvent-System.git
cd BianEvent-System
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Tạo file .env cho từng service

```bash
cp services/user-service/.env.example services/user-service/.env
cp services/event-service/.env.example services/event-service/.env
cp services/booking-service/.env.example services/booking-service/.env
cp services/notification-service/.env.example services/notification-service/.env
cp services/gateway/.env.example services/gateway/.env
```

Điền các giá trị cần thiết vào từng file `.env`.

### 4. Khởi động infrastructure

```bash
pnpm infra:up
```

Chờ khoảng 30-60 giây cho Kafka khởi động. Kiểm tra:

```bash
docker compose ps
```

Tất cả status `healthy` là được.

### 5. Migrate database

```bash
pnpm --filter user-service prisma:migrate
pnpm --filter event-service prisma:migrate
pnpm --filter booking-service prisma:migrate
pnpm --filter notification-service prisma:migrate
```

### 6. Chạy services

```bash
pnpm dev:services
```

### 7. Chạy frontend (terminal khác)

```bash
pnpm dev:web
pnpm dev:dashboard
```

---

## Ports

| Service              | Port   |
| -------------------- | ------ |
| API Gateway          | `3000` |
| User Service         | `3001` |
| Event Service        | `3002` |
| Booking Service      | `3003` |
| Notification Service | `3004` |
| Web (Next.js)        | `4000` |
| Dashboard (Next.js)  | `4001` |
| PostgreSQL           | `5432` |
| Redis                | `6379` |
| Kafka                | `9092` |
| Kafka UI             | `8080` |

---

## Environment Variables

### User Service

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_users
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=user-service
INTERNAL_API_KEY=your_internal_secret
WEB_URL=http://localhost:4000
```

### Event Service

```env
PORT=3002
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_events
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=event-service
INTERNAL_API_KEY=your_internal_secret
JWT_ACCESS_SECRET=your_access_secret
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your_public_url
```

### Booking Service

```env
PORT=3003
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_bookings
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=booking-service
KAFKA_GROUP_ID=booking-group
INTERNAL_API_KEY=your_internal_secret
JWT_ACCESS_SECRET=your_access_secret
EVENT_SERVICE_URL=http://localhost:3002
```

### Notification Service

```env
PORT=3004
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_notifications
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-group
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
JWT_ACCESS_SECRET=your_access_secret
INTERNAL_API_KEY=your_internal_secret
USER_SERVICE_URL=http://localhost:3001
WEB_URL=http://localhost:4000
DASHBOARD_URL=http://localhost:4001
```

### Gateway

```env
PORT=3000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:3001
EVENT_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
INTERNAL_API_KEY=your_internal_secret
```

---

## Scripts

```bash
pnpm infra:up          # Khởi động Docker infrastructure
pnpm infra:down        # Dừng Docker infrastructure
pnpm dev:gateway       # Chạy API Gateway
pnpm dev:user          # Chạy User Service
pnpm dev:event         # Chạy Event Service
pnpm dev:booking       # Chạy Booking Service
pnpm dev:notification  # Chạy Notification Service
pnpm dev:services      # Chạy tất cả services cùng lúc
pnpm dev:web           # Chạy Web frontend
pnpm dev:dashboard     # Chạy Dashboard frontend
```

---

## Kafka UI

Truy cập `http://localhost:8080` để xem Kafka topics và messages trực quann.

## Author
TrBinhDev - https://github.com/TrBinhDev - trbinh.dev@gmail.com

## License
Copyright (c) 2026 Trần Thanh Bình. All rights reserved / MIT License.