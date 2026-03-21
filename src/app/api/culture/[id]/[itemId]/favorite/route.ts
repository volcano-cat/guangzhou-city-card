import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const cultureItemId = parseInt(params.itemId)

    if (isNaN(cultureItemId)) {
      return errorResponse('无效的文化项目ID')
    }

    const cultureItem = await prisma.cultureItem.findUnique({
      where: { id: cultureItemId },
    })

    if (!cultureItem) {
      return notFoundResponse('文化项目不存在')
    }

    const existingFavorite = await prisma.cultureFavorite.findUnique({
      where: {
        userId_cultureItemId: {
          userId: user.userId,
          cultureItemId,
        },
      },
    })

    if (existingFavorite) {
      return errorResponse('已经收藏过了')
    }

    await prisma.cultureFavorite.create({
      data: {
        userId: user.userId,
        cultureItemId,
      },
    })

    return successResponse(null, '收藏成功')

  } catch (error) {
    console.error('收藏错误:', error)
    return errorResponse('收藏失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const cultureItemId = parseInt(params.itemId)

    await prisma.cultureFavorite.deleteMany({
      where: {
        userId: user.userId,
        cultureItemId,
      },
    })

    return successResponse(null, '取消收藏成功')

  } catch (error) {
    console.error('取消收藏错误:', error)
    return errorResponse('取消收藏失败', 500)
  }
}