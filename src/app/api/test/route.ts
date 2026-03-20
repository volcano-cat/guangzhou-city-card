import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    return successResponse({ message: '测试API正常工作' })
  } catch (error) {
    console.error('测试API错误:', error)
    return new Response('测试API失败', { status: 500 })
  }
}
