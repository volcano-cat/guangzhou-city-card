import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = {
      status: 'ACTIVE',
    }

    if (type) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sort: 'asc' },
    })

    return successResponse(categories)

  } catch (error) {
    console.error('获取分类错误:', error)
    return errorResponse('获取分类失败', 500)
  }
}
