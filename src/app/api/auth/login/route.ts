import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('请输入邮箱和密码')
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return errorResponse('用户不存在')
    }

    if (user.status === 'DISABLED') {
      return errorResponse('账户已被禁用')
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return errorResponse('密码错误')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
    })

    const { password: _, ...userWithoutPassword } = user

    const response = successResponse({
      user: userWithoutPassword,
    }, '登录成功')

    return setAuthCookies(response, token, refreshToken)

  } catch (error) {
    console.error('登录错误:', error)
    return errorResponse('登录失败，请稍后重试', 500)
  }
}
