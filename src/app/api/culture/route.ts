import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '6')
    const skip = (page - 1) * pageSize

    const [cultures, total] = await Promise.all([
      prisma.culture.findMany({
        where: {
          status: 'PUBLISHED'
        },
        include: {
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.culture.count({
        where: {
          status: 'PUBLISHED'
        }
      })
    ])

    return successResponse({
      list: cultures,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '获取文化列表成功')

  } catch (error) {
    console.error('获取文化列表错误:', error)
    return errorResponse('获取文化列表失败，请稍后重试', 500)
  }
}
