import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try { 
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const sessionId = parseInt(params.id)

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('获取聊天会话失败:', error)
    return NextResponse.json({ error: '获取聊天会话失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const sessionId = parseInt(params.id)
    const body = await request.json()
    const { title } = body

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId
      }
    })

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    const updatedSession = await prisma.chatSession.update({
      where: {
        id: sessionId
      },
      data: {
        title: title || session.title
      }
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('更新聊天会话失败:', error)
    return NextResponse.json({ error: '更新聊天会话失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const sessionId = parseInt(params.id)

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId
      }
    })

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    await prisma.chatMessage.deleteMany({
      where: {
        sessionId: sessionId
      }
    });

    await prisma.chatSession.delete({
      where: {
        id: sessionId
      }
    });

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除聊天会话失败:', error)
    return NextResponse.json({ error: '删除聊天会话失败' }, { status: 500 })
  }
}
