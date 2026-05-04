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

    // 不允许修改自己的角色
    if (id === user.userId && role !== user.role) {
      return errorResponse('不能修改自己的角色')
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
        status: true,
        createdAt: true
      }
    })

    return successResponse(updatedUser, '更新用户成功')

  } catch (error) {
    console.error('更新用户错误:', error)
    return errorResponse('更新用户失败', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // 不允许删除自己的账号
    if (id === user.userId) {
      return errorResponse('不能删除自己的账号')
    }

    await prisma.user.delete({
      where: { id }
    })

    return successResponse(null, '删除用户成功')

  } catch (error) {
    console.error('删除用户错误:', error)
    return errorResponse('删除用户失败', 500)
  }
}