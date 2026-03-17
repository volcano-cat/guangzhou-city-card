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

    const foodId = parseInt(params.id)

    if (isNaN(foodId)) {
      return errorResponse('无效的美食ID')
    }

    const food = await prisma.food.findUnique({
      where: { id: foodId },
    })

    if (!food) {
      return notFoundResponse('美食不存在')
    }

    const existingFavorite = await prisma.foodFavorite.findUnique({
      where: {
        userId_foodId: {
          userId: user.userId,
          foodId,
        },
      },
    })

    if (existingFavorite) {
      return errorResponse('已经收藏过了')
    }

    await prisma.foodFavorite.create({
      data: {
        userId: user.userId,
        foodId,
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

    const foodId = parseInt(params.id)

    await prisma.foodFavorite.deleteMany({
      where: {
        userId: user.userId,
        foodId,
      },
    })

    return successResponse(null, '取消收藏成功')

  } catch (error) {
    console.error('取消收藏错误:', error)
    return errorResponse('取消收藏失败', 500)
  }
}
