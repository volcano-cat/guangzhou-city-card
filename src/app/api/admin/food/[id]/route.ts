import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/response'
import { unlinkSync, existsSync } from 'fs'
import path from 'path'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('无效的美食ID')
    }

    const body = await request.json()
    const { name, description, images, restaurants, categoryId, status } = body

    if (!name || !description || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    // 获取旧的美食信息
    const oldFood = await prisma.food.findUnique({
      where: { id }
    })

    const food = await prisma.food.update({
      where: { id },
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

    // 删除旧的图片文件（仅当图片被更换时）
    if (oldFood?.images && Array.isArray(oldFood.images) && oldFood.images.length > 0) {
      oldFood.images.forEach(oldImage => {
        // 检查旧图片是否仍然在新的图片列表中
        const isImageStillUsed = images && Array.isArray(images) && images.includes(oldImage)
        if (!isImageStillUsed) {
          // 从URL中提取文件名
          const filename = oldImage.split('/').pop()
          if (filename) {
            const filePath = path.join(process.cwd(), 'storage', 'foods', filename)
            // 检查文件是否存在，存在则删除
            if (existsSync(filePath)) {
              try {
                unlinkSync(filePath)
              } catch (error) {
                console.error('删除旧图片失败:', error)
              }
            }
          }
        }
      })
    }

    return successResponse(food, '更新美食成功')

  } catch (error) {
    console.error('更新美食错误:', error)
    return errorResponse('更新美食失败', 500)
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('无效的美食ID')
    }

    // 获取旧的美食信息
    const oldFood = await prisma.food.findUnique({
      where: { id }
    })

    await prisma.food.delete({
      where: { id }
    })

    // 删除相关的图片文件
    if (oldFood?.images && Array.isArray(oldFood.images) && oldFood.images.length > 0) {
      oldFood.images.forEach(oldImage => {
        // 从URL中提取文件名
        const filename = oldImage.split('/').pop()
        if (filename) {
          const filePath = path.join(process.cwd(), 'storage', 'foods', filename)
          // 检查文件是否存在，存在则删除
          if (existsSync(filePath)) {
            try {
              unlinkSync(filePath)
            } catch (error) {
              console.error('删除图片失败:', error)
            }
          }
        }
      })
    }

    return successResponse(null, '删除美食成功')

  } catch (error) {
    console.error('删除美食错误:', error)
    return errorResponse('删除美食失败', 500)
  }
}