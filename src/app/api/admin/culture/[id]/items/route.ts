import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/response'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const [items, total] = await Promise.all([
      prisma.cultureItem.findMany({
        where: { cultureId: parseInt(id) },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.cultureItem.count({
        where: { cultureId: parseInt(id) }
      })
    ])

    return successResponse({
      list: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }, '获取文化项目列表成功')

  } catch (error) {
    console.error('获取文化项目列表错误:', error)
    return errorResponse('获取文化项目列表失败', 500)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id } = params
    const body = await request.json()
    const { name, description, image, status } = body

    if (!name || !description) {
      return errorResponse('缺少必填字段')
    }

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const item = await prisma.cultureItem.create({
      data: {
        name,
        description,
        image: image || null,
        status: status || 'PUBLISHED',
        cultureId: parseInt(id)
      }
    })

    return successResponse(item, '创建文化项目成功')

  } catch (error) {
    console.error('创建文化项目错误:', error)
    return errorResponse('创建文化项目失败', 500)
  }
}
