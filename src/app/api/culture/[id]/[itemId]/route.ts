import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string, itemId: string } }) {
  try {
    const { itemId } = params
    
    // 更新浏览量
    await prisma.cultureItem.update({
      where: { id: parseInt(itemId) },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })
    
    const cultureItem = await prisma.cultureItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        culture: true,
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

    if (!cultureItem) {
      return notFoundResponse('文化项目不存在')
    }
    
    // 检查状态
    if (cultureItem.status !== 'PUBLISHED') {
      return notFoundResponse('文化项目未发布')
    }
    
    if (!cultureItem.culture) {
      return notFoundResponse('文化分类不存在')
    }
    
    if (cultureItem.culture.status !== 'PUBLISHED') {
      return notFoundResponse('文化分类未发布')
    }

    // 检查是否已收藏
    let isFavorited = false
    const userPayload = await authenticate(request)
    if (userPayload) {
      const favorite = await prisma.cultureFavorite.findFirst({
        where: {
          cultureItemId: parseInt(itemId),
          userId: userPayload.userId
        }
      })
      isFavorited = !!favorite

      // 获取用户对评论的点赞状态
      if (cultureItem.comments) {
        // 收集所有评论和回复的 ID
        const commentIds = cultureItem.comments.flatMap(comment => {
          return [comment.id, ...comment.replies.map(reply => reply.id)]
        })

        // 查询用户的点赞记录
        const likes = await prisma.cultureCommentLike.findMany({
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
        cultureItem.comments = cultureItem.comments.map(comment => {
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

    return successResponse({ ...cultureItem, isFavorited }, '获取文化项目详情成功')

  } catch (error) {
    console.error('获取文化项目详情错误:', error)
    return errorResponse('获取文化项目详情失败，请稍后重试', 500)
  }
}