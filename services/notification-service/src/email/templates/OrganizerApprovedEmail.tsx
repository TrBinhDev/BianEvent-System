import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components'

interface OrganizerApprovedEmailProps {
  fullName: string
  dashboardUrl: string
}

export const OrganizerApprovedEmail = ({ fullName, dashboardUrl }: OrganizerApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#333' }}>Chúc mừng bạn trở thành Organizer!</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>
            Đơn đăng ký Organizer của bạn đã được duyệt. Bạn có thể bắt đầu tạo và quản lý
            sự kiện ngay bây giờ.
          </Text>
          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: '#4F46E5',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
              margin: '20px 0',
            }}
          >
            Vào Dashboard
          </Button>
          <Text style={{ color: '#666' }}>
            Nếu nút trên không hoạt động, truy cập: {dashboardUrl}
          </Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrganizerApprovedEmail