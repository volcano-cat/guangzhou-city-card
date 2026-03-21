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

    const [cultures, total] = await Promise.all([
      prisma.culture.findMany({
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
      prisma.culture.count()
    ])

    return successResponse({
      list: cultures,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '获取文化分类列表成功')

  } catch (error) {
    console.error('获取文化分类列表错误:', error)
    return errorResponse('获取文化分类列表失败', 500)
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
    const { name, description, icon, image, status } = body

    if (!name || !description || !icon) {
      return errorResponse('缺少必填字段')
    }

    const culture = await prisma.culture.create({
      data: {
        name,
        description,
        icon,
        image: image || null,
        status: status || 'PUBLISHED'
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return successResponse(culture, '创建文化分类成功')

  } catch (error) {
    console.error('创建文化分类错误:', error)
    return errorResponse('创建文化分类失败', 500)
  }
}
