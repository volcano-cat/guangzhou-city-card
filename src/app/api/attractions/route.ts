import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const categoryId = searchParams.get('categoryId')
    const keyword = searchParams.get('keyword')

    const where: any = {
      status: 'PUBLISHED'
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ]
    }

    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              favorites: true,
              comments: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          viewCount: 'desc'
        }
      }),
      prisma.attraction.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    return successResponse(
      {
        list: attractions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      },
      '获取景点列表成功'
    )

  } catch (error) {
    console.error('获取景点列表错误:', error)
    return errorResponse('获取景点列表失败，请稍后重试', 500)
  }
}
