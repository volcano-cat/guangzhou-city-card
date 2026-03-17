import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return errorResponse('无效的美食ID')
    }

    const user = await authenticate(request)

    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        category: true,
        comments: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            favorites: true,
            comments: true,
          },
        },
      },
    })

    if (!food) {
      return notFoundResponse('美食不存在')
    }

    await prisma.food.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    let isFavorited = false
    if (user) {
      const favorite = await prisma.foodFavorite.findUnique({
        where: {
          userId_foodId: {
            userId: user.userId,
            foodId: id,
          },
        },
      })
      isFavorited = !!favorite
    }

    return successResponse({
      ...food,
      isFavorited,
    })

  } catch (error) {
    console.error('获取美食详情错误:', error)
    return errorResponse('获取美食详情失败', 500)
  }
}
