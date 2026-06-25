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

interface OtpEmailProps {
  fullName: string
  otp: string
}

export const OtpEmail = ({ fullName, otp }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#333' }}>Xác thực email</Heading>
          <Text>Xin chào {fullName},</Text>
          <Text>Mã OTP của bạn để xác thực tài khoản BianEvent:</Text>
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                letterSpacing: '8px',
                color: '#4F46E5',
                backgroundColor: '#EEF2FF',
                padding: '16px 32px',
                borderRadius: '8px',
              }}
            >
              {otp}
            </Text>
          </Section>
          <Text style={{ color: '#666' }}>Mã OTP có hiệu lực trong <strong>10 phút</strong>.</Text>
          <Text style={{ color: '#666' }}>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</Text>
          <Hr />
          <Text style={{ color: '#999', fontSize: '12px' }}>BianEvent — Nền tảng mua bán vé sự kiện</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OtpEmail