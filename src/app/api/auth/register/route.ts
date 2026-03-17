import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nickname } = body

    if (!email || !password) {
      return errorResponse('请输入邮箱和密码')
    }

    if (password.length < 6) {
      return errorResponse('密码至少6位')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('该邮箱已被注册')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return successResponse({
      user,
      token,
    }, '注册成功')

  } catch (error) {
    console.error('注册错误:', error)
    return errorResponse('注册失败，请稍后重试', 500)
  }
}
