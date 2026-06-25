# Docker Compose — Development Infrastructure

> Chỉ chạy infrastructure (DB, Redis, Kafka).
> Các service Node.js và Next.js chạy thẳng bằng `pnpm dev` trên máy.

---

## Khởi động

```bash
# Khởi động toàn bộ infrastructure
docker compose up -d

# Xem logs
docker compose logs -f

# Dừng
docker compose down

# Dừng và xoá toàn bộ data
docker compose down -v
```

---

## docker-compose.yml

```yaml
version: "3.9"

services:
  # ============================================================
  # PostgreSQL — 4 database riêng cho từng service
  # ============================================================
  postgres:
    image: postgres:16-alpine
    container_name: ticketing_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================
  # Redis
  # ============================================================
  redis:
    image: redis:7-alpine
    container_name: ticketing_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================
  # Zookeeper — Kafka cần
  # ============================================================
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: ticketing_zookeeper
    restart: unless-stopped
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
      - zookeeper_logs:/var/lib/zookeeper/log
    healthcheck:
      test: ["CMD-SHELL", "echo ruok | nc localhost 2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================
  # Kafka
  # ============================================================
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: ticketing_kafka
    restart: unless-stopped
    depends_on:
      zookeeper:
        condition: service_healthy
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_NUM_PARTITIONS: 1
    ports:
      - "9092:9092"
    volumes:
      - kafka_data:/var/lib/kafka/data
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "kafka-broker-api-versions --bootstrap-server localhost:9092",
        ]
      interval: 15s
      timeout: 10s
      retries: 5

  # ============================================================
  # Kafka UI — xem topic, message trực quan (optional nhưng tiện)
  # ============================================================
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: ticketing_kafka_ui
    restart: unless-stopped
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
    ports:
      - "8080:8080"

# ============================================================
# Volumes
# ============================================================
volumes:
  postgres_data:
  redis_data:
  zookeeper_data:
  zookeeper_logs:
  kafka_data:
```

---

## docker/postgres/init.sql

> File này chạy tự động khi PostgreSQL khởi động lần đầu — tạo sẵn 4 database.

```sql
CREATE DATABASE db_users;
CREATE DATABASE db_events;
CREATE DATABASE db_bookings;
CREATE DATABASE db_notifications;
```

---

## Ports tổng hợp

| Service              | Port   | Mô tả                               |
| -------------------- | ------ | ----------------------------------- |
| PostgreSQL           | `5432` | Dùng chung, 4 DB riêng              |
| Redis                | `6379` |                                     |
| Zookeeper            | `2181` | Kafka cần, không truy cập trực tiếp |
| Kafka                | `9092` |                                     |
| Kafka UI             | `8080` | Xem topic/message trên browser      |
| User Service         | `3001` | Chạy bằng `pnpm dev`                |
| Event Service        | `3002` | Chạy bằng `pnpm dev`                |
| Booking Service      | `3003` | Chạy bằng `pnpm dev`                |
| Notification Service | `3004` | Chạy bằng `pnpm dev`                |
| Web (Next.js)        | `4000` | Chạy bằng `pnpm dev`                |
| Dashboard (Next.js)  | `4001` | Chạy bằng `pnpm dev`                |

---

## Kết nối từ service Node.js

```env
# PostgreSQL — mỗi service dùng DB riêng
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_users
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_events
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_bookings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_notifications

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
```

---

## Notes

- `KAFKA_AUTO_CREATE_TOPICS_ENABLE: true` — Kafka tự tạo topic khi service publish lần đầu, không cần tạo thủ công
- Kafka UI chạy ở `http://localhost:8080` — xem message trong topic rất tiện khi debug
- `docker compose down -v` sẽ xoá toàn bộ data — cẩn thận khi dùng
- Chạy `docker compose up -d` trước rồi mới `pnpm dev` các service
