import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const attractionPage = parseInt(searchParams.get('attractionPage') || '1')
    const attractionPageSize = parseInt(searchParams.get('attractionPageSize') || '3')
    const foodPage = parseInt(searchParams.get('foodPage') || '1')
    const foodPageSize = parseInt(searchParams.get('foodPageSize') || '3')

    // 获取收藏的景点总数
    const attractionTotal = await prisma.favorite.count({
      where: { userId: user.userId }
    })

    // 获取收藏的景点
    const attractionFavorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      include: {
        attraction: {
          select: {
            id: true,
            name: true,
            address: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (attractionPage - 1) * attractionPageSize,
      take: attractionPageSize,
    })

    // 获取收藏的美食总数
    const foodTotal = await prisma.foodFavorite.count({
      where: { userId: user.userId }
    })

    // 获取收藏的美食
    const foodFavorites = await prisma.foodFavorite.findMany({
      where: { userId: user.userId },
      include: {
        food: {
          select: {
            id: true,
            name: true,
            description: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (foodPage - 1) * foodPageSize,
      take: foodPageSize,
    })

    // 整合数据
    const favorites = {
      attractions: {
        list: attractionFavorites,
        pagination: {
          page: attractionPage,
          pageSize: attractionPageSize,
          total: attractionTotal,
          totalPages: Math.ceil(attractionTotal / attractionPageSize)
        }
      },
      foods: {
        list: foodFavorites,
        pagination: {
          page: foodPage,
          pageSize: foodPageSize,
          total: foodTotal,
          totalPages: Math.ceil(foodTotal / foodPageSize)
        }
      }
    }

    return successResponse(favorites)

  } catch (error) {
    console.error('获取收藏列表错误:', error)
    return errorResponse('获取收藏列表失败', 500)
  }
}
