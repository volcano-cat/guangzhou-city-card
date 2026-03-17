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
      return errorResponse('无效的景点ID')
    }

    const user = await authenticate(request)

    const attraction = await prisma.attraction.findUnique({
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

    if (!attraction) {
      return notFoundResponse('景点不存在')
    }

    await prisma.attraction.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    let isFavorited = false
    if (user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_attractionId: {
            userId: user.userId,
            attractionId: id,
          },
        },
      })
      isFavorited = !!favorite
    }

    return successResponse({
      ...attraction,
      isFavorited,
    })

  } catch (error) {
    console.error('获取景点详情错误:', error)
    return errorResponse('获取景点详情失败', 500)
  }
}
