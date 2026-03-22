import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { verifyVerificationCode, clearVerificationCode } from '@/lib/verification'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, newPassword } = body

    if (!email || !code || !newPassword) {
      return errorResponse('请输入邮箱、验证码和新密码')
    }

    if (newPassword.length < 6) {
      return errorResponse('密码至少6位')
    }

    // 验证验证码
    const isCodeValid = verifyVerificationCode(email, code)
    if (!isCodeValid) {
      return errorResponse('验证码错误或已过期')
    }

    // 检查邮箱是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return errorResponse('该邮箱未注册')
    }

    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword)

    // 更新用户密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    // 清理验证码
    clearVerificationCode(email)

    return successResponse({}, '密码重置成功')

  } catch (error) {
    console.error('重置密码错误:', error)
    return errorResponse('重置密码失败，请稍后重试', 500)
  }
}
