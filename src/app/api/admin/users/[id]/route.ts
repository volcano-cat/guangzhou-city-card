import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/response'

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