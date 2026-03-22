import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'
import { verifyVerificationCode, clearVerificationCode } from '@/lib/verification'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nickname, code } = body

    if (!email || !password || !code) {
      return errorResponse('请输入邮箱、密码和验证码')
    }

    if (password.length < 6) {
      return errorResponse('密码至少6位')
    }

    // 验证验证码
    const isCodeValid = verifyVerificationCode(email, code)
    if (!isCodeValid) {
      return errorResponse('验证码错误或已过期')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('该邮箱已被注册')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 清理验证码
    clearVerificationCode(email)

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
    })

    const response = successResponse({
      user,
    }, '注册成功')

    return setAuthCookies(response, token, refreshToken)

  } catch (error) {
    console.error('注册错误:', error)
    return errorResponse('注册失败，请稍后重试', 500)
  }
}
