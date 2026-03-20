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
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.attraction.count()
    ])

    return successResponse(
      {
        data: attractions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      '获取景点列表成功'
    )

  } catch (error) {
    console.error('获取景点列表错误:', error)
    return errorResponse('获取景点列表失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { name, description, address, images, openTime, ticketInfo, categoryId, status } = body

    if (!name || !description || !address || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    const attraction = await prisma.attraction.create({
      data: {
        name,
        description,
        address,
        images,
        openTime,
        ticketInfo,
        categoryId,
        status: status || 'PUBLISHED'
      },
      include: {
        category: true
      }
    })

    return successResponse(attraction, '创建景点成功')

  } catch (error) {
    console.error('创建景点错误:', error)
    return errorResponse('创建景点失败', 500)
  }
}