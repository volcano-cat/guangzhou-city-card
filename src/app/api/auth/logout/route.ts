import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/auth'
import { successResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const response = successResponse({}, '登出成功')
    return clearAuthCookies(response)
  } catch (error) {
    console.error('登出错误:', error)
    const response = successResponse({}, '登出成功')
    return clearAuthCookies(response)
  }
}
