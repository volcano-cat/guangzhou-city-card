import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const commentId = parseInt(params.commentId)

    if (isNaN(commentId)) {
      return errorResponse('无效的评论ID')
    }

    const existingLike = await prisma.foodCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.userId,
          commentId,
        },
      },
    })

    if (existingLike) {
      return errorResponse('已经点赞过了')
    }

    await prisma.foodCommentLike.create({
      data: {
        userId: user.userId,
        commentId,
      },
    })

    return successResponse(null, '点赞成功')

  } catch (error) {
    console.error('点赞错误:', error)
    return errorResponse('点赞失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const commentId = parseInt(params.commentId)

    await prisma.foodCommentLike.deleteMany({
      where: {
        userId: user.userId,
        commentId,
      },
    })

    return successResponse(null, '取消点赞成功')

  } catch (error) {
    console.error('取消点赞错误:', error)
    return errorResponse('取消点赞失败', 500)
  }
}
