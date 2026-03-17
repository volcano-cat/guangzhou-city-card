import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

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
    const body = await request.json()
    const { content, rating } = body

    if (!content || content.trim() === '') {
      return errorResponse('请输入评论内容')
    }

    const comment = await prisma.foodComment.create({
      data: {
        userId: user.userId,
        foodId,
        content,
        rating: rating || null,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    if (rating) {
      const avgRating = await prisma.foodComment.aggregate({
        where: {
          foodId,
          rating: { not: null },
          status: 'APPROVED',
        },
        _avg: {
          rating: true,
        },
      })

      if (avgRating._avg.rating) {
        await prisma.food.update({
          where: { id: foodId },
          data: { rating: avgRating._avg.rating },
        })
      }
    }

    return successResponse(comment, '评论成功')

  } catch (error) {
    console.error('评论错误:', error)
    return errorResponse('评论失败', 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const foodId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where = {
      foodId,
      status: 'APPROVED' as const,
    }

    const total = await prisma.foodComment.count({ where })

    const comments = await prisma.foodComment.findMany({
      where,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return successResponse({
      list: comments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })

  } catch (error) {
    console.error('获取评论错误:', error)
    return errorResponse('获取评论失败', 500)
  }
}
