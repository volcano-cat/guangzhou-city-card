import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/response'
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
      return errorResponse('无效的景点ID')
    }

    const body = await request.json()
    const { name, description, address, images, openTime, ticketInfo, categoryId, status } = body

    if (!name || !description || !address || !categoryId) {
      return errorResponse('缺少必填字段')
    }

    // 获取旧的景点信息
    const oldAttraction = await prisma.attraction.findUnique({
      where: { id }
    })

    const attraction = await prisma.attraction.update({
      where: { id },
      data: {
        name,
        description,
        address,
        images,
        openTime,
        ticketInfo,
        categoryId,
        status: status || 'PUBLISHED'
      },
      include: {
        category: true
      }
    })

    // 删除旧的图片文件（仅当图片被更换时）
    if (oldAttraction?.images && Array.isArray(oldAttraction.images) && oldAttraction.images.length > 0) {
      oldAttraction.images.forEach(oldImage => {
        // 检查旧图片是否仍然在新的图片列表中
        const isImageStillUsed = images && Array.isArray(images) && images.includes(oldImage)
        if (!isImageStillUsed && typeof oldImage === 'string') {
          // 从URL中提取文件名
          const filename = oldImage.split('/').pop()
          if (filename) {
            const filePath = path.join(process.cwd(), 'storage', 'attractions', filename)
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

    return successResponse(attraction, '更新景点成功')

  } catch (error) {
    console.error('更新景点错误:', error)
    return errorResponse('更新景点失败', 500)
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
      return errorResponse('无效的景点ID')
    }

    // 获取旧的景点信息
    const oldAttraction = await prisma.attraction.findUnique({
      where: { id }
    })

    await prisma.attraction.delete({
      where: { id }
    })

    // 删除相关的图片文件
    if (oldAttraction?.images && Array.isArray(oldAttraction.images) && oldAttraction.images.length > 0) {
      oldAttraction.images.forEach(oldImage => {
        // 从URL中提取文件名
        if (typeof oldImage === 'string') {
          const filename = oldImage.split('/').pop()
          if (filename) {
            const filePath = path.join(process.cwd(), 'storage', 'attractions', filename)
            // 检查文件是否存在，存在则删除
            if (existsSync(filePath)) {
              try {
                unlinkSync(filePath)
              } catch (error) {
                console.error('删除图片失败:', error)
              }
            }
          }
        }
      })
    }

    return successResponse(null, '删除景点成功')

  } catch (error) {
    console.error('删除景点错误:', error)
    return errorResponse('删除景点失败', 500)
  }
}