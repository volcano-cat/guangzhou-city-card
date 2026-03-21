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

    const body = await request.json()
    const { content, rating, parentId } = body

    if (!content || content.trim() === '') {
      return errorResponse('评论内容不能为空')
    }

    const comment = await prisma.cultureComment.create({
      data: {
        userId: user.userId,
        cultureItemId,
        content: content.trim(),
        rating,
        parentId,
      },
    })

    return successResponse(comment, '评论成功')

  } catch (error) {
    console.error('评论错误:', error)
    return errorResponse('评论失败', 500)
  }
}