import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: user.userId,
        status: 'ACTIVE'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('获取聊天会话失败:', error)
    return NextResponse.json({ error: '获取聊天会话失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title } = body

    const session = await prisma.chatSession.create({
      data: {
        userId: user.userId,
        title: title || '新对话'
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('创建聊天会话失败:', error)
    return NextResponse.json({ error: '创建聊天会话失败' }, { status: 500 })
  }
}
