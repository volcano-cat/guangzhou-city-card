import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const categoryId = searchParams.get('categoryId')
    const keyword = searchParams.get('keyword')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      status: 'PUBLISHED',
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { address: { contains: keyword } },
      ]
    }

    const total = await prisma.attraction.count({ where })

    const attractions = await prisma.attraction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            comments: true,
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
      list: attractions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })

  } catch (error) {
    console.error('获取景点列表错误:', error)
    return errorResponse('获取景点列表失败', 500)
  }
}
