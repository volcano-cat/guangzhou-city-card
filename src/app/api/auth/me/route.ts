import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)

    if (!payload) {
      return unauthorizedResponse()
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
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return unauthorizedResponse()
    }

    return successResponse(user)

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return errorResponse('获取用户信息失败', 500)
  }
}
