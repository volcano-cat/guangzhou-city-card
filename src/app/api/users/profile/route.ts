import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userPayload = await authenticate(request)
    if (!userPayload) {
      return errorResponse('未登录', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

    return successResponse(user, '获取用户资料成功')

  } catch (error) {
    console.error('获取用户资料错误:', error)
    return errorResponse('获取用户资料失败，请稍后重试', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userPayload = await authenticate(request)
    if (!userPayload) {
      return errorResponse('未登录', 401)
    }

    const body = await request.json()
    const { nickname, avatar } = body

    if (!nickname && !avatar) {
      return errorResponse('请提供要修改的资料')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse(updatedUser, '修改用户资料成功')

  } catch (error) {
    console.error('修改用户资料错误:', error)
    return errorResponse('修改用户资料失败，请稍后重试', 500)
  }
}
