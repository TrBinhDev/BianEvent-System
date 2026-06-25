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

interface ResetPasswordEmailProps {
  fullName: string
  resetLink: string
}

export const ResetPasswordEmail = ({ fullName, resetLink }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#333' }}>Đặt lại mật khẩu</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            Bấm vào nút bên dưới để đặt lại mật khẩu:
          </Text>
          <Button
            href={resetLink}
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
            Đặt lại mật khẩu
          </Button>
          <Text style={{ color: '#666' }}>
            Link có hiệu lực trong <strong>10 phút</strong>.
          </Text>
          <Text style={{ color: '#666' }}>
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail