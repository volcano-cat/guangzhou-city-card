import nodemailer from 'nodemailer'

const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.163.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465')

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465端口使用SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
})

interface SendVerificationEmailParams {
  to: string
  code: string
}

export async function sendVerificationEmail({
  to,
  code
}: SendVerificationEmailParams): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"广州城市名片" <${SMTP_USER}>`,
      to,
      subject: '注册验证码',
      text: `您的注册验证码是：${code}，有效期为10分钟。`,
      html: `<p>您的注册验证码是：<strong>${code}</strong>，有效期为10分钟。</p>`
    })
    
    console.log('验证码邮件发送成功：', info.messageId)
    return true
  } catch (error) {
    console.error('验证码邮件发送失败：', error)
    return false
  }
}
