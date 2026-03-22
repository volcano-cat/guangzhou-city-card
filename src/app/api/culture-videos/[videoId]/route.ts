import { NextRequest } from 'next/server'
import { createReadStream } from 'fs'
import path from 'path'
import { errorResponse } from '@/lib/response'

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params
    
    // 视频存储路径
    const videoPath = path.join(process.cwd(), 'storage', 'culture', videoId)
    
    // 检查文件是否存在
    if (!await fileExists(videoPath)) {
      return errorResponse('视频文件不存在', 404)
    }
    
    // 创建可读流
    const stream = createReadStream(videoPath)
    
    // 确定内容类型
    const contentType = getContentType(videoId)
    
    // 返回视频流
    return new Response(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${videoId}"`,
      },
    })
    
  } catch (error) {
    console.error('获取视频文件错误:', error)
    return errorResponse('获取视频文件失败', 500)
  }
}

// 检查文件是否存在
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await import('fs').then((fs) => fs.promises.access(filePath))
    return true
  } catch {
    return false
  }
}

// 根据文件名获取内容类型
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.mp4':
      return 'video/mp4'
    case '.avi':
      return 'video/x-msvideo'
    case '.mov':
      return 'video/quicktime'
    case '.wmv':
      return 'video/x-ms-wmv'
    case '.flv':
      return 'video/x-flv'
    case '.webm':
      return 'video/webm'
    default:
      return 'video/mp4'
  }
}