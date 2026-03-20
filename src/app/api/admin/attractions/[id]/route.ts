import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/response'

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
      return errorResponse('无效的景点ID')
    }

    const body = await request.json()
    const { name, description, address, images, openTime, ticketInfo, categoryId, status } = body

    if (!name || !description || !address || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    const attraction = await prisma.attraction.update({
      where: { id },
      data: {
        name,
        description,
        address,
        images,
        openTime,
        ticketInfo,
        categoryId,
        status: status || 'PUBLISHED'
      },
      include: {
        category: true
      }
    })

    return successResponse(attraction, '更新景点成功')

  } catch (error) {
    console.error('更新景点错误:', error)
    return errorResponse('更新景点失败', 500)
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
      return errorResponse('无效的景点ID')
    }

    await prisma.attraction.delete({
      where: { id }
    })

    return successResponse(null, '删除景点成功')

  } catch (error) {
    console.error('删除景点错误:', error)
    return errorResponse('删除景点失败', 500)
  }
}