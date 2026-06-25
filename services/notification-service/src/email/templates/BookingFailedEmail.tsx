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
} from '@react-email/components'

interface BookingFailedEmailProps {
  fullName: string
  eventTitle: string
  reason: string
}

export const BookingFailedEmail = ({ fullName, eventTitle, reason }: BookingFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#333' }}>Đặt vé không thành công</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>Rất tiếc, yêu cầu đặt vé của bạn không thành công:</Text>
          <Section
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '16px',
              margin: '20px 0',
            }}
          >
            <Text style={{ margin: '4px 0' }}><strong>Sự kiện:</strong> {eventTitle}</Text>
            <Text style={{ margin: '4px 0', color: '#DC2626' }}><strong>Lý do:</strong> {reason}</Text>
          </Section>
          <Text style={{ color: '#666' }}>
            Vui lòng thử lại hoặc chọn sự kiện khác.
          </Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingFailedEmail