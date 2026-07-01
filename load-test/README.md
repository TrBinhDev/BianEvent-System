# Load Testing — BianEvent

Load test cho hệ thống BianEvent bằng [k6](https://k6.io/), tập trung vào throughput, latency (p95) và hành vi của hệ thống dưới tải.

> **⚠️ Lưu ý về môi trường:** Toàn bộ kết quả dưới đây được đo trên **môi trường local** (k6, backend và database chạy trên cùng một máy). Số liệu chỉ mang tính **tương đối**, dùng để so sánh giữa các endpoint và xác định bottleneck — **không phản ánh hiệu năng production** (không có độ trễ mạng thật, các thành phần giành chung tài nguyên một máy).

---

## Môi trường test

| Thành phần | Chi tiết                                                     |
| ---------- | ------------------------------------------------------------ |
| Công cụ    | k6 v2.0.0                                                    |
| Backend    | Node.js / Express microservices (qua API Gateway, port 3000) |
| Database   | PostgreSQL (Database-per-Service)                            |
| Hạ tầng    | Redis, Kafka, Docker Compose                                 |
| Máy test   | Local (Windows)                                              |

---

## Tổng hợp kết quả

| Endpoint          | Method | VU  | QPS    | p95 latency | Success | Error |
| ----------------- | ------ | --- | ------ | ----------- | ------- | ----- |
| `/api/events`     | GET    | 10  | ~7.5/s | 17.36 ms    | 100%    | 0%    |
| `/api/events/:id` | GET    | 10  | ~7.4/s | 19.61 ms    | 100%    | 0%    |
| `/api/bookings`   | POST   | 5   | ~3.9/s | 42.49 ms    | \*      | \*    |

\* Xem giải thích chi tiết ở mục Booking bên dưới — tỉ lệ "lỗi" ở đây là hành vi đúng (chống oversell), không phải lỗi hệ thống.

---

## Chi tiết từng test

### 1. GET `/api/events` — danh sách sự kiện

Kịch bản: tăng dần lên 10 VU (mô phỏng người dùng thật, có `sleep(1)` giữa các request).

- **QPS:** ~7.5 req/s
- **Latency:** avg 10.29 ms · med 9.15 ms · **p95 17.36 ms** · max 26.25 ms
- **Thành công:** 100% (0% lỗi)

Endpoint đọc danh sách sự kiện xử lý nhanh và ổn định, 95% request trả về dưới ~18ms.

### 2. GET `/api/events/:id` — chi tiết sự kiện

Kịch bản: tương tự test 1 (10 VU, có sleep).

- **QPS:** ~7.4 req/s
- **Latency:** avg 12.56 ms · **p95 19.61 ms** · max 32.6 ms
- **Thành công:** 100% (0% lỗi)

Endpoint chi tiết trả về dữ liệu đầy đủ hơn (kèm ticket types, category) nên chậm hơn danh sách một chút, nhưng chênh lệch không đáng kể — cả hai đều dưới 20ms.

### 3. POST `/api/bookings` — đặt vé (luồng quan trọng nhất)

Kịch bản: 5 VU đặt vé liên tục cho một loại vé có **100 slot**. Mỗi request mang `Idempotency-Key` riêng và token JWT.

- **Latency (booking thành công):** avg 37 ms · **p95 42.49 ms** · max 377 ms
- **Kết quả:** **100 booking thành công (HTTP 201)**, 38 request trả **HTTP 409 "hết vé"**.

**Vì sao có 38 request "lỗi" — đây là hành vi đúng, không phải bug:**

Loại vé có đúng **100 slot**. Hệ thống bán ra **chính xác 100 vé** rồi từ chối phần còn lại bằng 409 "hết vé". Điều này chứng minh cơ chế **chống oversell** hoạt động đúng: dù nhiều request đồng thời, tổng vé bán ra **không bao giờ vượt số slot**.

Cơ chế chống oversell:

- `UPDATE ... WHERE available_slots >= quantity` ở Event Service — Postgres dùng row-level lock, transaction sau re-check điều kiện trên giá trị mới nhất; khi hết vé thì update 0 dòng và trả 409.
- Luồng đặt vé hoàn chỉnh (idempotency check → seat lock → trừ slot → Prisma transaction → publish Kafka) chạy trong ~42ms ở p95.

### 4. Rate limiting (100 VU, không sleep)

Khi đẩy lên 100 VU bắn liên tục (~10.000 req/s), ~99% request trả về **HTTP 429 (Too Many Requests)**.

Đây là **rate limiting của API Gateway hoạt động đúng** (global limit). Nó bảo vệ backend khỏi bị dội request khi tải vượt ngưỡng. Bài học rút ra: throughput thật phải tính theo **request thành công**, không phải tổng request gửi đi — QPS cao mà error rate cao thì con số QPS đó vô nghĩa.

---

## Bài học / quan sát

- **Latency vs throughput:** với tải mô phỏng người dùng thật (có `sleep`), QPS thấp không có nghĩa server yếu — latency (p95 < 20ms cho GET) cho thấy server xử lý nhanh; QPS bị giới hạn bởi `sleep` cố ý, không phải năng lực server.
- **"Lỗi" không phải lúc nào cũng là bug:** 409 (hết vé) và 429 (rate limit) là các tuyến phòng thủ hoạt động đúng, cần phân biệt với lỗi 500 thật sự.
- **Chống oversell được kiểm chứng bằng số liệu:** 100 slot → đúng 100 vé bán ra, không hơn.

---

## Cách chạy

```bash
# Bật backend (Gateway + services + DB) trước, đảm bảo http://localhost:3000/api/events trả về data

# Chạy từng test
k6 run scripts/get-events.js
k6 run scripts/event-detail.js
k6 run scripts/create-booking.js
```

## Cấu trúc thư mục

```
load-test/
├── README.md
├── scripts/          # các script k6
│   ├── get-events.js
│   ├── event-detail.js
│   └── create-booking.js
└── results/          # ảnh kết quả test
```
// Dev by TrBinhDev