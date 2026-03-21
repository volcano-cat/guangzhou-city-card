import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          where: {
            status: 'PUBLISHED'
          },
          include: {
            _count: {
              select: {
                favorites: true,
                comments: true
              }
            }
          },
          orderBy: {
            viewCount: 'desc'
          }
        }
      }
    })

    if (!culture || culture.status !== 'PUBLISHED') {
      return notFoundResponse('文化分类不存在')
    }

    return successResponse(culture, '获取文化分类详情成功')

  } catch (error) {
    console.error('获取文化分类详情错误:', error)
    return errorResponse('获取文化分类详情失败，请稍后重试', 500)
  }
}