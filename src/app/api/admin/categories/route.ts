import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where = type ? { type } : {}

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        type: true
      },
      where,
      orderBy: {
        sort: 'asc'
      }
    })

    return successResponse(categories, '获取分类列表成功')

  } catch (error) {
    console.error('获取分类列表错误:', error)
    return errorResponse('获取分类列表失败', 500)
  }
}