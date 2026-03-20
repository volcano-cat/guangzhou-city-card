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
      return errorResponse('无效的美食ID')
    }

    const body = await request.json()
    const { name, description, images, restaurants, categoryId, status } = body

    if (!name || !description || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    const food = await prisma.food.update({
      where: { id },
      data: {
        name,
        description,
        images,
        restaurants,
        categoryId,
        status: status || 'PUBLISHED'
      },
      include: {
        category: true
      }
    })

    return successResponse(food, '更新美食成功')

  } catch (error) {
    console.error('更新美食错误:', error)
    return errorResponse('更新美食失败', 500)
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
      return errorResponse('无效的美食ID')
    }

    await prisma.food.delete({
      where: { id }
    })

    return successResponse(null, '删除美食成功')

  } catch (error) {
    console.error('删除美食错误:', error)
    return errorResponse('删除美食失败', 500)
  }
}