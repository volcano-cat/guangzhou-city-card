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
          OR: [
            { email: { contains: search } },
            { nickname: { contains: search } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true
        },
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ])

    return successResponse(
      {
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      '获取用户列表成功'
    )

  } catch (error) {
    console.error('获取用户列表错误:', error)
    return errorResponse('获取用户列表失败', 500)
  }
}