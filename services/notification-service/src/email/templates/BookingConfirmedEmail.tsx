import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Hr,
} from "@react-email/components";

interface BookingConfirmedEmailProps {
  fullName: string;
  eventTitle: string;
  ticketTypeName: string;
  zone: string;
  startAt: string;
  venueName: string;
  ticketId: string;
  // ❌ Đã xóa qrCodeBase64
}

export const BookingConfirmedEmail = ({
  fullName,
  eventTitle,
  ticketTypeName,
  zone,
  startAt,
  venueName,
  ticketId,
}: BookingConfirmedEmailProps) => {
  const formattedDate = new Date(startAt).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Body
        style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4" }}
      >
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}
        >
          <Heading style={{ color: "#333" }}>🎫 Đặt vé thành công!</Heading>
          <Text>
            Xin chào <strong>{fullName}</strong>,
          </Text>
          <Text>
            Vé của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:
          </Text>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              margin: "20px 0",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ margin: "4px 0" }}>
              <strong>🎪 Sự kiện:</strong> {eventTitle}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>🎫 Loại vé:</strong> {ticketTypeName}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>📍 Khu vực:</strong> {zone || "Chung"}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>📅 Thời gian:</strong> {formattedDate}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>📍 Địa điểm:</strong> {venueName}
            </Text>
            <Text style={{ margin: "4px 0", color: "#999", fontSize: "12px" }}>
              🆔 Mã vé: {ticketId.slice(0, 8).toUpperCase()}
            </Text>
          </Section>

          {/* ✅ QR Code hiển thị từ attachment qua CID */}
          <Section style={{ textAlign: "center", margin: "20px 0" }}>
            <Text style={{ fontSize: "14px", color: "#555" }}>
              <strong>🔽 Quét mã QR để check-in</strong>
            </Text>
            <img
              src={`cid:qr-${ticketId}`}
              alt="QR Code"
              width="180"
              height="180"
              style={{
                margin: "0 auto",
                display: "block",
                border: "2px solid #e8e0d5",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
          </Section>

          <Text style={{ color: "#666", fontSize: "14px" }}>
            Vui lòng xuất trình mã QR này khi check-in tại sự kiện.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

          <Text
            style={{ color: "#999", fontSize: "12px", textAlign: "center" }}
          >
            © BianEvent — Nền tảng mua bán vé sự kiện
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmedEmail;
