import { NextRequest } from 'next/server'
import { writeFile, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { successResponse, errorResponse } from '@/lib/response'
import { authenticate } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userPayload = await authenticate(request)
    if (!userPayload) {
      return errorResponse('未登录', 401)
    }

    let file: File | null = null
    try {
      const formData = await request.formData()
      file = formData.get('file') as File

      if (!file) {
        console.error('未选择文件')
        return errorResponse('请选择文件')
      }

      console.log('上传文件:', file.name, file.type, file.size)

      if (!file.type || !file.type.startsWith('video/')) {
        console.error('文件类型错误:', file.type)
        return errorResponse('只能上传视频文件')
      }

      // 限制文件大小为200MB
      if (file.size > 200 * 1024 * 1024) {
        console.error('文件大小超出限制:', file.size)
        return errorResponse('视频文件大小不能超过200MB')
      }
    } catch (error) {
      console.error('解析FormData错误:', error)
      return errorResponse('请求格式错误', 400)
    }

    // 确保file不为null
    if (!file) {
      return errorResponse('请选择文件')
    }

    // 生成唯一文件名
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${file.type.split('/')[1]}`
    
    // 存储在服务器的非public目录
    const uploadDir = path.join(process.cwd(), 'storage', 'culture')
    
    // 确保目录存在
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const fullPath = path.join(uploadDir, fileName)

    // 读取文件内容并写入
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // 异步写入文件
    await new Promise<void>((resolve, reject) => {
      writeFile(fullPath, buffer, (err) => {
        if (err) {
          console.error('文件写入错误:', err)
          reject(new Error('文件写入失败'))
        } else {
          resolve()
        }
      })
    })

    // 生成访问URL（通过API访问）
    const videoUrl = `/api/culture-videos/${fileName}`

    return successResponse({ url: videoUrl }, '上传成功')

  } catch (error) {
    console.error('上传错误:', error)
    return errorResponse('上传失败，请稍后重试', 500)
  }
}