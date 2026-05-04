import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/response'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const food = await prisma.food.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true
                  }
                },
                _count: {
                  select: {
                    likes: true
                  }
                }
              }
            },
            _count: {
              select: {
                likes: true,
                replies: true
              }
            }
          },
          where: {
            parentId: null
          }
        },
        _count: {
          select: {
            favorites: true,
            comments: true
          }
        }
      }
    })

    if (!food) {
      return errorResponse('美食不存在', 404)
    }

    // 检查是否已收藏
    let isFavorited = false
    const userPayload = await authenticate(request)
    if (userPayload) {
      const favorite = await prisma.foodFavorite.findFirst({
        where: {
          foodId: parseInt(id),
          userId: userPayload.userId
        }
      })
      isFavorited = !!favorite

      // 获取用户对评论的点赞状态
      if (food.comments) {
        // 收集所有评论和回复的 ID
        const commentIds = food.comments.flatMap(comment => {
          return [comment.id, ...comment.replies.map(reply => reply.id)]
        })

        // 查询用户的点赞记录
        const likes = await prisma.foodCommentLike.findMany({
          where: {
            userId: userPayload.userId,
            commentId: {
              in: commentIds
            }
          },
          select: {
            commentId: true
          }
        })

        // 创建点赞 ID 集合
        const likedCommentIds = new Set(likes.map(like => like.commentId))

        // 为评论和回复添加 isLiked 字段
        food.comments = food.comments.map(comment => {
          const updatedComment = {
            ...comment,
            isLiked: likedCommentIds.has(comment.id)
          }

          // 为回复添加 isLiked 字段
          if (updatedComment.replies) {
            updatedComment.replies = updatedComment.replies.map(reply => ({
              ...reply,
              isLiked: likedCommentIds.has(reply.id)
            }))
          }

          return updatedComment
        })
      }
    }

    // 增加浏览量
    await prisma.food.update({
      where: { id: parseInt(id) },
      data: {
        viewCount: { increment: 1 }
      }
    })

    return successResponse({ ...food, restaurants: food.restaurants || null, isFavorited }, '获取美食详情成功')

  } catch (error) {
    console.error('获取美食详情错误:', error)
    return errorResponse('获取美食详情失败，请稍后重试', 500)
  }
}
