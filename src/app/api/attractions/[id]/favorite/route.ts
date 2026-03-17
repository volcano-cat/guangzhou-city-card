import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const attractionId = parseInt(params.id)

    if (isNaN(attractionId)) {
      return errorResponse('无效的景点ID')
    }

    const attraction = await prisma.attraction.findUnique({
      where: { id: attractionId },
    })

    if (!attraction) {
      return notFoundResponse('景点不存在')
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_attractionId: {
          userId: user.userId,
          attractionId,
        },
      },
    })

    if (existingFavorite) {
      return errorResponse('已经收藏过了')
    }

    await prisma.favorite.create({
      data: {
        userId: user.userId,
        attractionId,
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const attractionId = parseInt(params.id)

    await prisma.favorite.deleteMany({
      where: {
        userId: user.userId,
        attractionId,
      },
    })

    return successResponse(null, '取消收藏成功')

  } catch (error) {
    console.error('取消收藏错误:', error)
    return errorResponse('取消收藏失败', 500)
  }
}
