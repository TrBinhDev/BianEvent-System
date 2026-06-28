import http from "k6/http";
import { check, sleep } from "k6";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

const BASE_URL = "http://localhost:3000";
const TICKET_TYPE_ID = "1c2fb652-0e1c-40d9-a7b4-2b934811e2b2"; // Standard, còn 100 vé

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 5 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.1"],
  },
};

// Login 1 lần ở đầu, lấy token dùng chung
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: "binhniee@gmail.com", password: "12345678" }),
    { headers: { "Content-Type": "application/json" } },
  );
  const token = res.json("accessToken");
  return { token };
}

export default function (data) {
  const res = http.post(
    `${BASE_URL}/api/bookings`,
    JSON.stringify({ ticketTypeId: TICKET_TYPE_ID, quantity: 1 }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
        "Idempotency-Key": uuidv4(), // mỗi request 1 key mới
      },
    },
  );

  check(res, {
    "status 201": (r) => r.status === 201,
  });

  // In status nếu lỗi để debug
  if (res.status !== 201) {
    console.log(
      "FAIL:",
      res.status,
      res.body ? res.body.substring(0, 150) : "",
    );
  }

  sleep(1);
}
