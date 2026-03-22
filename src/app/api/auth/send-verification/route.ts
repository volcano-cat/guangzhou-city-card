import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, storeVerificationCode } from '@/lib/verification'
import { sendVerificationEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return errorResponse('请输入邮箱地址')
    }

    // 生成验证码
    const code = generateVerificationCode()

    // 存储验证码
    storeVerificationCode(email, code)

    // 发送验证码邮件
    const sent = await sendVerificationEmail({ to: email, code })

    if (!sent) {
      return errorResponse('验证码发送失败，请稍后重试')
    }

    return successResponse({}, '验证码已发送，请查收邮箱')

  } catch (error) {
    console.error('发送验证码错误:', error)
    return errorResponse('发送验证码失败，请稍后重试', 500)
  }
}
