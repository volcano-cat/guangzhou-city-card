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

    const attractionId = parseInt(params.id)
    const body = await request.json()
    const { content, rating, parentId } = body

    if (!content || content.trim() === '') {
      return errorResponse('请输入评论内容')
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.userId,
        attractionId,
        parentId: parentId || null,
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
      const avgRating = await prisma.comment.aggregate({
        where: {
          attractionId,
          rating: { not: null },
          status: 'APPROVED',
        },
        _avg: {
          rating: true,
        },
      })

      if (avgRating._avg.rating) {
        await prisma.attraction.update({
          where: { id: attractionId },
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
    const attractionId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where = {
      attractionId,
      status: 'APPROVED' as const,
      parentId: null, // 只获取顶级评论
    }

    const total = await prisma.comment.count({ where })

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
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
