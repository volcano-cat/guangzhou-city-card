import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    if (!refreshToken) {
      return errorResponse('缺少刷新令牌', 401)
    }

    const payload = verifyRefreshToken(refreshToken)
    
    if (!payload) {
      return errorResponse('无效的刷新令牌', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
      },
    })

    if (!user) {
      return errorResponse('用户不存在', 401)
    }

    if (user.status === 'DISABLED') {
      return errorResponse('账户已被禁用', 403)
    }

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
    })

    const response = successResponse({
      user,
    }, '令牌刷新成功')

    return setAuthCookies(response, newToken, newRefreshToken)

  } catch (error) {
    console.error('刷新令牌错误:', error)
    return errorResponse('刷新令牌失败，请重新登录', 500)
  }
}
