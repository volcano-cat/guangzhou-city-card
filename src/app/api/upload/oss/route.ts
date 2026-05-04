import { NextRequest } from 'next/server'
import { authenticate } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/response'
import { getOssUploadUrl } from '@/lib/oss'

export async function POST(request: NextRequest) {
  try {
    const userPayload = await authenticate(request)
    if (!userPayload) {
      return errorResponse('未登录', 401)
    }

    const body = await request.json()
    const { fileName, contentType } = body

    if (!fileName || !contentType) {
      return errorResponse('缺少必要参数', 400)
    }

    const { uploadUrl, fileUrl } = await getOssUploadUrl(fileName, contentType)

    return successResponse({ uploadUrl, fileUrl }, '获取上传URL成功')

  } catch (error) {
    console.error('获取OSS上传URL失败:', error)
    return errorResponse('获取上传URL失败，请稍后重试', 500)
  }
}
