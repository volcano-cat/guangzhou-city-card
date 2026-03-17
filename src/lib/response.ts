import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export function successResponse<T>(
  data: T,
  message = 'Success'
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function errorResponse(
  error: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: '未授权访问，请先登录',
    },
    { status: 401 }
  )
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: '权限不足',
    },
    { status: 403 }
  )
}

export function notFoundResponse(
  message = '资源不存在'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  )
}
