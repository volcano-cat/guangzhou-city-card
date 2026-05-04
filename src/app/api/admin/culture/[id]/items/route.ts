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
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * pageSize

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    const where = search
      ? {
          cultureId: parseInt(id),
          name: { contains: search }
        }
      : {
          cultureId: parseInt(id)
        }

    const [items, total] = await Promise.all([
      prisma.cultureItem.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.cultureItem.count({ where })
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
    console.log('创建文化项目请求数据:', body)
    const { name, description, image, video, status } = body

    if (!name || !description) {
      return errorResponse('缺少必填字段')
    }

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    // 构建创建数据对象
    const createData: any = {
      name,
      description,
      cultureId: parseInt(id)
    }
    
    if (image !== undefined) {
      createData.image = image || null
    }
    if (video !== undefined) {
      createData.video = video || null
    }
    if (status !== undefined) {
      createData.status = status || 'PUBLISHED'
    }
    
    console.log('创建数据:', createData)
    
    const item = await prisma.cultureItem.create({
      data: createData
    })

    return successResponse(item, '创建文化项目成功')

  } catch (error) {
    console.error('创建文化项目错误:', error)
    return errorResponse('创建文化项目失败', 500)
  }
}
