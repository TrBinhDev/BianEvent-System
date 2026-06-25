# Monorepo Structure — Event Ticketing System

## Tech stack

| Layer           | Tech                           |
| --------------- | ------------------------------ |
| Package manager | pnpm workspaces                |
| Backend         | Node.js + Express + TypeScript |
| Frontend        | Next.js 14 (App Router)        |
| ORM             | Prisma                         |
| Validation      | Zod                            |
| Message broker  | Apache Kafka (kafkajs)         |
| Cache           | Redis (ioredis)                |
| Email           | Resend + React Email           |
| Realtime        | Socket.io                      |

---

## Cấu trúc thư mục

```
BianEvent-System/
├── apps/
│   ├── web/                        # Next.js — trang public cho User
│   └── dashboard/                  # Next.js — trang Organizer + Admin
│
├── services/
│   ├── gateway/                    # API Gateway
│   ├── user-service/               # User Service :3001
│   ├── event-service/              # Event Service :3002
│   ├── booking-service/            # Booking Service :3003
│   └── notification-service/       # Notification Service :3004
│
├── packages/
│   ├── types/                      # TypeScript types dùng chung
│   ├── kafka/                      # Kafka client dùng chung
│   └── utils/                      # Utilities dùng chung
│
├── docker/
│   └── postgres/
│       └── init.sql                # Tạo 4 database khi khởi động
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json                    # Root package.json
└── tsconfig.base.json              # Base TypeScript config
```

---

## Chi tiết từng phần

### apps/web/

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx            # Trang chủ — danh sách event
│   │   │   ├── events/
│   │   │   │   ├── page.tsx        # Danh sách event + filter
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Chi tiết event + mua vé
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   └── (user)/
│   │       ├── bookings/
│   │       │   ├── page.tsx        # Lịch sử đặt vé
│   │       │   └── [id]/page.tsx   # Chi tiết booking + QR
│   │       └── notifications/
│   │           └── page.tsx        # Trang thông báo
│   └── components/
├── next.config.js
└── package.json
```

### apps/dashboard/

```
apps/dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (organizer)/
│   │   │   ├── events/
│   │   │   │   ├── page.tsx        # Danh sách event của mình
│   │   │   │   ├── create/page.tsx # Tạo event mới
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Chi tiết + sửa event
│   │   │   │       └── stats/page.tsx # Thống kê vé đã bán
│   │   │   └── layout.tsx
│   │   └── (admin)/
│   │       ├── users/page.tsx      # Quản lý user
│   │       ├── events/page.tsx     # Quản lý tất cả event
│   │       ├── bookings/page.tsx   # Quản lý booking
│   │       ├── categories/page.tsx # Quản lý categories
│   │       ├── applications/page.tsx # Duyệt đơn Organizer
│   │       └── layout.tsx
│   └── components/
├── next.config.js
└── package.json
```

### services/gateway/

```
services/gateway/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── middlewares/
│   │   ├── authenticate.ts         # Gọi User Service verify JWT
│   │   ├── authorize.ts            # Check role từ JWT payload
│   │   ├── rate-limit.ts           # Rate limiting
│   │   └── error-handler.ts
│   ├── routes/
│   │   ├── user.routes.ts          # Proxy → User Service
│   │   ├── event.routes.ts         # Proxy → Event Service
│   │   ├── booking.routes.ts       # Proxy → Booking Service
│   │   └── notification.routes.ts  # Proxy → Notification Service
│   └── app.ts
├── Dockerfile
├── .env.example
└── package.json
```

### packages/types/

```
packages/types/
├── src/
│   ├── kafka/
│   │   ├── user.types.ts           # Payload types cho user topics
│   │   ├── event.types.ts          # Payload types cho event topics
│   │   ├── booking.types.ts        # Payload types cho booking topics
│   │   └── notification.types.ts   # Payload types cho notification topics
│   ├── api/
│   │   └── response.types.ts       # Standard API response type
│   └── index.ts
└── package.json
```

### packages/kafka/

```
packages/kafka/
├── src/
│   ├── producer.ts                 # Base Kafka producer
│   ├── consumer.ts                 # Base Kafka consumer
│   └── index.ts
└── package.json
```

### packages/utils/

```
packages/utils/
├── src/
│   ├── hash.ts                     # bcrypt, SHA-256
│   ├── token.ts                    # JWT sign/verify
│   ├── otp.ts                      # Generate OTP 6 số
│   ├── response.ts                 # Standard API response helper
│   └── index.ts
└── package.json
```

---

## pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

---

## package.json (root)

```json
{
  "name": "event-ticketing",
  "private": true,
  "scripts": {
    "dev:gateway": "pnpm --filter gateway dev",
    "dev:user": "pnpm --filter user-service dev",
    "dev:event": "pnpm --filter event-service dev",
    "dev:booking": "pnpm --filter booking-service dev",
    "dev:notification": "pnpm --filter notification-service dev",
    "dev:web": "pnpm --filter web dev",
    "dev:dashboard": "pnpm --filter dashboard dev",
    "dev:services": "concurrently \"pnpm dev:gateway\" \"pnpm dev:user\" \"pnpm dev:event\" \"pnpm dev:booking\" \"pnpm dev:notification\"",
    "infra:up": "docker compose up -d",
    "infra:down": "docker compose down",
    "build": "pnpm --filter './services/*' build && pnpm --filter './apps/*' build"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

Mỗi service extend từ base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## Khởi động dự án lần đầu

```bash
# 1. Clone repo
git clone <repo-url>
cd event-ticketing

# 2. Install dependencies
pnpm install

# 3. Khởi động infrastructure
pnpm infra:up

# 4. Copy env files
cp services/user-service/.env.example services/user-service/.env
cp services/event-service/.env.example services/event-service/.env
cp services/booking-service/.env.example services/booking-service/.env
cp services/notification-service/.env.example services/notification-service/.env

# 5. Migrate database
pnpm --filter user-service prisma:migrate
pnpm --filter event-service prisma:migrate
pnpm --filter booking-service prisma:migrate
pnpm --filter notification-service prisma:migrate

# 6. Chạy tất cả services
pnpm dev:services

# 7. Chạy frontend (terminal khác)
pnpm dev:web
pnpm dev:dashboard
```

---

## Notes

- Packages trong `packages/` được import theo tên: `@ticketing/types`, `@ticketing/kafka`, `@ticketing/utils`
- Mỗi service có `package.json` riêng với tên `@ticketing/user-service`, `@ticketing/event-service`...
- Không install package ở root — chỉ install vào đúng service/app cần dùng
- `concurrently` để chạy nhiều service cùng lúc bằng 1 lệnh `pnpm dev:services`
