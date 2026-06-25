import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Hr,
  Img,
} from '@react-email/components'

interface BookingConfirmedEmailProps {
  fullName: string
  eventTitle: string
  ticketTypeName: string
  zone: string
  startAt: string
  venueName: string
  ticketId: string
  qrCodeBase64: string
}

export const BookingConfirmedEmail = ({
  fullName,
  eventTitle,
  ticketTypeName,
  zone,
  startAt,
  venueName,
  ticketId,
  qrCodeBase64,
}: BookingConfirmedEmailProps) => {
  const formattedDate = new Date(startAt).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#333' }}>Đặt vé thành công!</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>Vé của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:</Text>

          <Section
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              margin: '20px 0',
              border: '1px solid #e5e7eb',
            }}
          >
            <Text style={{ margin: '4px 0' }}><strong>Sự kiện:</strong> {eventTitle}</Text>
            <Text style={{ margin: '4px 0' }}><strong>Loại vé:</strong> {ticketTypeName}</Text>
            <Text style={{ margin: '4px 0' }}><strong>Khu vực:</strong> {zone}</Text>
            <Text style={{ margin: '4px 0' }}><strong>Thời gian:</strong> {formattedDate}</Text>
            <Text style={{ margin: '4px 0' }}><strong>Địa điểm:</strong> {venueName}</Text>
            <Text style={{ margin: '4px 0', color: '#999', fontSize: '12px' }}>
              Mã vé: {ticketId}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text><strong>Mã QR check-in:</strong></Text>
            <Img
              src={qrCodeBase64}
              alt="QR Code"
              width="200"
              height="200"
              style={{ margin: '0 auto' }}
            />
          </Section>

          <Text style={{ color: '#666' }}>
            Vui lòng xuất trình mã QR này khi check-in tại sự kiện.
          </Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingConfirmedEmail