import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
} from '@react-email/components'

interface EventCancelledEmailProps {
  fullName: string
  eventTitle: string
  startAt: string
}

export const EventCancelledEmail = ({ fullName, eventTitle, startAt }: EventCancelledEmailProps) => {
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
          <Heading style={{ color: '#333' }}>Thông báo huỷ sự kiện</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>
            Chúng tôi rất tiếc phải thông báo rằng sự kiện bạn đã đặt vé đã bị huỷ:
          </Text>
          <Text
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '16px',
              color: '#DC2626',
            }}
          >
            <strong>{eventTitle}</strong>
            <br />
            Thời gian dự kiến: {formattedDate}
          </Text>
          <Text style={{ color: '#666' }}>
            Vé của bạn đã được huỷ. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.
          </Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EventCancelledEmail