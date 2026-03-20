import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/response'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('无效的用户ID')
    }

    const body = await request.json()
    const { role, status } = body

    if (!role || !status) {
      return errorResponse('缺少必填字段')
    }

    // 不允许修改自己的角色为非管理员
    if (id === user.userId && role !== 'ADMIN') {
      return errorResponse('不能将自己的角色修改为非管理员')
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
        status
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        status: true
      }
    })

    return successResponse(updatedUser, '更新用户角色成功')

  } catch (error) {
    console.error('更新用户角色错误:', error)
    return errorResponse('更新用户角色失败', 500)
  }
}