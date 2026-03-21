import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/response'

export async function GET(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id, itemId } = params

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const item = await prisma.cultureItem.findFirst({
      where: {
        id: parseInt(itemId),
        cultureId: parseInt(id)
      }
    })

    if (!item) {
      return notFoundResponse('文化项目不存在')
    }

    return successResponse(item, '获取文化项目详情成功')

  } catch (error) {
    console.error('获取文化项目详情错误:', error)
    return errorResponse('获取文化项目详情失败', 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id, itemId } = params
    const body = await request.json()
    const { name, description, image, status } = body

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const existingItem = await prisma.cultureItem.findFirst({
      where: {
        id: parseInt(itemId),
        cultureId: parseInt(id)
      }
    })

    if (!existingItem) {
      return notFoundResponse('文化项目不存在')
    }

    const item = await prisma.cultureItem.update({
      where: { id: parseInt(itemId) },
      data: {
        name: name || existingItem.name,
        description: description || existingItem.description,
        image: image !== undefined ? image : existingItem.image,
        status: status || existingItem.status
      }
    })

    return successResponse(item, '更新文化项目成功')

  } catch (error) {
    console.error('更新文化项目错误:', error)
    return errorResponse('更新文化项目失败', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id, itemId } = params

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const existingItem = await prisma.cultureItem.findFirst({
      where: {
        id: parseInt(itemId),
        cultureId: parseInt(id)
      }
    })

    if (!existingItem) {
      return notFoundResponse('文化项目不存在')
    }

    // 删除相关的评论和收藏
    await prisma.comment.deleteMany({
      where: { cultureItemId: parseInt(itemId) }
    })

    await prisma.favorite.deleteMany({
      where: { cultureItemId: parseInt(itemId) }
    })

    // 删除文化项目
    await prisma.cultureItem.delete({
      where: { id: parseInt(itemId) }
    })

    return successResponse(null, '删除文化项目成功')

  } catch (error) {
    console.error('删除文化项目错误:', error)
    return errorResponse('删除文化项目失败', 500)
  }
}
