import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFileSync, existsSync } from 'fs'

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params
    
    // 构建文件路径
    const filePath = path.join(process.cwd(), 'storage', 'avatars', filename)
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      // 如果文件不存在，返回默认头像
      const defaultAvatarPath = path.join(process.cwd(), 'public', 'moren_avatar', 'moren_avatar.jpg')
      if (existsSync(defaultAvatarPath)) {
        const defaultAvatar = readFileSync(defaultAvatarPath)
        return new NextResponse(defaultAvatar, {
          headers: {
            'Content-Type': 'image/jpeg'
          }
        })
      }
      return new NextResponse('Avatar not found', { status: 404 })
    }
    
    // 读取文件
    const file = readFileSync(filePath)
    
    // 确定文件类型
    let contentType = 'image/jpeg'
    if (filename.endsWith('.png')) {
      contentType = 'image/png'
    } else if (filename.endsWith('.gif')) {
      contentType = 'image/gif'
    } else if (filename.endsWith('.webp')) {
      contentType = 'image/webp'
    }
    
    // 返回文件
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType
      }
    })
    
  } catch (error) {
    console.error('获取头像错误:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
