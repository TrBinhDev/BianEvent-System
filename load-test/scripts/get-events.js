import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api/events");
  check(res, { "status la 200": (r) => r.status === 200 });
  sleep(1);
}

// có thể cấu hình summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'], để là danh sách giá trị muốn k6 in ra cho latency