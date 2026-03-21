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

    const culture = await prisma.culture.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!culture) {
      return notFoundResponse('文化分类不存在')
    }

    return successResponse(culture, '获取文化分类详情成功')

  } catch (error) {
    console.error('获取文化分类详情错误:', error)
    return errorResponse('获取文化分类详情失败', 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { name, description, icon, image, status } = body

    const existingCulture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCulture) {
      return notFoundResponse('文化分类不存在')
    }

    const culture = await prisma.culture.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingCulture.name,
        description: description || existingCulture.description,
        icon: icon || existingCulture.icon,
        image: image !== undefined ? image : existingCulture.image,
        status: status || existingCulture.status
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return successResponse(culture, '更新文化分类成功')

  } catch (error) {
    console.error('更新文化分类错误:', error)
    return errorResponse('更新文化分类失败', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const { id } = params

    const existingCulture = await prisma.culture.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCulture) {
      return notFoundResponse('文化分类不存在')
    }

    // 删除相关的文化项目（级联删除）
    await prisma.cultureItem.deleteMany({
      where: { cultureId: parseInt(id) }
    })

    // 删除文化分类
    await prisma.culture.delete({
      where: { id: parseInt(id) }
    })

    return successResponse(null, '删除文化分类成功')

  } catch (error) {
    console.error('删除文化分类错误:', error)
    return errorResponse('删除文化分类失败', 500)
  }
}
