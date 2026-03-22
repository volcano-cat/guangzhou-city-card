import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = parseInt(params.userId)
    
    if (isNaN(userId)) {
      return errorResponse('无效的用户ID', 400)
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        email: true
      }
    })

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

    const { searchParams } = new URL(request.url)
    const attractionPage = parseInt(searchParams.get('attractionPage') || '1')
    const attractionPageSize = parseInt(searchParams.get('attractionPageSize') || '3')
    const foodPage = parseInt(searchParams.get('foodPage') || '1')
    const foodPageSize = parseInt(searchParams.get('foodPageSize') || '3')
    const culturePage = parseInt(searchParams.get('culturePage') || '1')
    const culturePageSize = parseInt(searchParams.get('culturePageSize') || '3')

    // 获取收藏的景点总数
    const attractionTotal = await prisma.favorite.count({
      where: { userId }
    })

    // 获取收藏的景点
    const attractionFavorites = await prisma.favorite.findMany({
      where: { userId },
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
      where: { userId }
    })

    // 获取收藏的美食
    const foodFavorites = await prisma.foodFavorite.findMany({
      where: { userId },
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

    // 获取收藏的文化总数
    const cultureTotal = await prisma.cultureFavorite.count({
      where: { userId }
    })

    // 获取收藏的文化
    const cultureFavorites = await prisma.cultureFavorite.findMany({
      where: { userId },
      include: {
        cultureItem: {
          select: {
            id: true,
            name: true,
            description: true,
            culture: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (culturePage - 1) * culturePageSize,
      take: culturePageSize,
    })

    // 整合数据
    const data = {
      profile: user,
      favorites: {
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
        },
        cultures: {
          list: cultureFavorites,
          pagination: {
            page: culturePage,
            pageSize: culturePageSize,
            total: cultureTotal,
            totalPages: Math.ceil(cultureTotal / culturePageSize)
          }
        }
      }
    }

    return successResponse(data)

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return errorResponse('获取用户信息失败', 500)
  }
}
