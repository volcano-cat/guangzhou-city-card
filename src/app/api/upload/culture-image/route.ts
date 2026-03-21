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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('请选择文件')
    }

    if (!file.type.startsWith('image/')) {
      return errorResponse('只能上传图片文件')
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
    const imageUrl = `/api/culture-images/${fileName}`

    return successResponse({ url: imageUrl }, '上传成功')

  } catch (error) {
    console.error('上传错误:', error)
    return errorResponse('上传失败，请稍后重试', 500)
  }
}
