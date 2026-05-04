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
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * pageSize

    const where = search
      ? {
          name: { contains: search }
        }
      : {}

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.food.count({ where })
    ])

    return successResponse(
      {
        data: foods,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      '获取美食列表成功'
    )

  } catch (error) {
    console.error('获取美食列表错误:', error)
    return errorResponse('获取美食列表失败', 500)
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
    const { name, description, images, restaurants, categoryId, status } = body

    if (!name || !description || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    const food = await prisma.food.create({
      data: {
        name,
        description,
        images,
        restaurants,
        categoryId,
        status: status || 'PUBLISHED'
      },
      include: {
        category: true
      }
    })

    return successResponse(food, '创建美食成功')

  } catch (error) {
    console.error('创建美食错误:', error)
    return errorResponse('创建美食失败', 500)
  }
}