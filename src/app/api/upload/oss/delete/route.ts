import { NextRequest, NextResponse } from 'next/server'
import { deleteOssFile } from '@/lib/oss'
import { authenticate } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userPayload = await authenticate(request)
    if (!userPayload) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { fileUrl } = body

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 })
    }

    await deleteOssFile(fileUrl)

    return NextResponse.json({ success: true, message: '删除成功' })

  } catch (error) {
    console.error('删除OSS文件失败:', error)
    return NextResponse.json({ success: false, error: '删除失败，请稍后重试' }, { status: 500 })
  }
}
