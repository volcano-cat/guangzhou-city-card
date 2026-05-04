'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

interface Comment {
  id: number
  content: string
  rating: number | null
  createdAt: string
  user: {
    id: number
    nickname: string | null
    avatar: string | null
  }
  replies: Comment[]
  _count: {
    likes: number
    replies: number
  }
  isLiked?: boolean
}

interface CultureItem {
  id: number
  name: string
  description: string
  image: string
  video: string
  viewCount: number
  culture: {
    id: number
    title: string
    icon: string
  }
  comments: Comment[]
  _count: {
    favorites: number
    comments: number
  }
  isFavorited: boolean
}

export default function CultureItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [item, setItem] = useState<CultureItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [commentRating, setCommentRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    if (params.id && params.itemId) {
      fetchCultureItem()
    }
  }, [params.id, params.itemId])

  useEffect(() => {
    if (item) {
      let sortedComments = [...item.comments]
      
      if (sortBy === '_count.likes') {
        sortedComments.sort((a, b) => {
          const likesA = a._count?.likes || 0
          const likesB = b._count?.likes || 0
          return sortOrder === 'desc' ? likesB - likesA : likesA - likesB
        })
      } else if (sortBy === 'createdAt') {
        sortedComments.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
        })
      }
      
      const commentsChanged = JSON.stringify(item.comments) !== JSON.stringify(sortedComments)
      if (commentsChanged) {
        setItem({
          ...item,
          comments: sortedComments
        })
      }
    }
  }, [sortBy, sortOrder, item])

  const fetchCultureItem = async () => {
    setLoading(true)
    try {
      const headers: any = {}

      
      const res = await axios.get(`/api/culture/${params.id}/${params.itemId}`, { headers })
      if (res.data.success) {
        setItem(res.data.data)
        setIsFavorited(res.data.data.isFavorited)
      } else {
        console.error('获取文化项目详情失败:', res.data.message)
        setItem(null)
      }
    } catch (error) {
      console.error('获取文化项目详情失败', error)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/culture/${params.id}/${params.itemId}`)
      return
    }

    try {
      if (isFavorited) {
        await axios.delete(`/api/culture/${params.id}/${params.itemId}/favorite`, { withCredentials: true })
        setIsFavorited(false)
        if (item) {
          setItem({
            ...item,
            isFavorited: false,
            _count: {
              ...item._count,
              favorites: item._count.favorites - 1
            }
          })
        }
      } else {
        await axios.post(`/api/culture/${params.id}/${params.itemId}/favorite`, {}, { withCredentials: true })
        setIsFavorited(true)
        if (item) {
          setItem({
            ...item,
            isFavorited: true,
            _count: {
              ...item._count,
              favorites: item._count.favorites + 1
            }
          })
        }
      }
    } catch (error) {
      console.error('操作失败', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      router.push(`/login?redirect=/culture/${params.id}/${params.itemId}`)
      return
    }

    if (!commentContent.trim()) {
      toast.error('请输入评论内容')
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post(
        `/api/culture/${params.id}/${params.itemId}/comments`,
        { content: commentContent, rating: commentRating },
        { withCredentials: true }
      )
      if (res.data.success) {
        setCommentContent('')
        if (item) {
          const newComment = {
            id: res.data.data.id,
            content: commentContent,
            rating: commentRating,
            createdAt: new Date().toISOString(),
            user: {
              id: user.id,
              nickname: user.nickname,
              avatar: user.avatar
            },
            replies: [],
            _count: {
              likes: 0,
              replies: 0
            },
            isLiked: false
          }
          const updatedComments = [newComment, ...item.comments]
          let sortedComments = [...updatedComments]
          if (sortBy === '_count.likes') {
            sortedComments.sort((a, b) => {
              const likesA = a._count?.likes || 0
              const likesB = b._count?.likes || 0
              return sortOrder === 'desc' ? likesB - likesA : likesA - likesB
            })
          } else if (sortBy === 'createdAt') {
            sortedComments.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime()
              const dateB = new Date(b.createdAt).getTime()
              return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
            })
          }
          setItem({
            ...item,
            comments: sortedComments,
            _count: {
              ...item._count,
              comments: item._count.comments + 1
            }
          })
        }
      }
    } catch (error) {
      console.error('评论失败', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: number) => {
    if (!user) {
      router.push(`/login?redirect=/culture/${params.id}/${params.itemId}`)
      return
    }

    if (!replyContent.trim()) {
      toast.error('请输入回复内容')
      return
    }

    setReplying(true)
    try {
      const res = await axios.post(
        `/api/culture/${params.id}/${params.itemId}/comments`,
        { content: replyContent, parentId },
        { withCredentials: true }
      )
      if (res.data.success) {
        setReplyContent('')
        setReplyingTo(null)
        if (item) {
          const newReply = {
            id: res.data.data.id,
            content: replyContent,
            rating: null,
            createdAt: new Date().toISOString(),
            user: {
              id: user.id,
              nickname: user.nickname,
              avatar: user.avatar
            },
            replies: [],
            _count: {
              likes: 0,
              replies: 0
            },
            isLiked: false
          }
          const updatedComments = item.comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...comment.replies, newReply],
                _count: {
                  ...comment._count,
                  replies: comment._count.replies + 1
                }
              }
            }
            return comment
          })
          setItem({
            ...item,
            comments: updatedComments
          })
        }
      }
    } catch (error) {
      console.error('回复失败', error)
    } finally {
      setReplying(false)
    }
  }

  const handleLike = async (commentId: number) => {
    if (!user) {
      router.push(`/login?redirect=/culture/${params.id}/${params.itemId}`)
      return
    }

    try {
      const res = await axios.post(
        `/api/culture/${params.id}/${params.itemId}/comments/${commentId}/like`,
        {},
        { withCredentials: true }
      )
      if (res.data.success) {
        if (item) {
          const updatedComments = item.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: true,
                _count: {
                  ...comment._count,
                  likes: comment._count.likes + 1
                }
              }
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === commentId) {
                    return {
                      ...reply,
                      isLiked: true,
                      _count: {
                        ...reply._count,
                        likes: reply._count.likes + 1
                      }
                    }
                  }
                  return reply
                })
              }
            }
            return comment
          })
          setItem({
            ...item,
            comments: updatedComments
          })
        }
      }
    } catch (error) {
      console.error('点赞失败', error)
    }
  }

  const handleUnlike = async (commentId: number) => {
    if (!user) {
      router.push(`/login?redirect=/culture/${params.id}/${params.itemId}`)
      return
    }

    try {
      const res = await axios.delete(
        `/api/culture/${params.id}/${params.itemId}/comments/${commentId}/like`,
        { withCredentials: true }
      )
      if (res.data.success) {
        if (item) {
          const updatedComments = item.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: false,
                _count: {
                  ...comment._count,
                  likes: Math.max(0, comment._count.likes - 1)
                }
              }
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === commentId) {
                    return {
                      ...reply,
                      isLiked: false,
                      _count: {
                        ...reply._count,
                        likes: Math.max(0, reply._count.likes - 1)
                      }
                    }
                  }
                  return reply
                })
              }
            }
            return comment
          })
          setItem({
            ...item,
            comments: updatedComments
          })
        }
      }
    } catch (error) {
      console.error('取消点赞失败', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">内容不存在</h1>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回{item.culture?.title || '文化'}列表
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 md:h-96 bg-gray-200 overflow-hidden p-0 m-0">
              <video
                src={item.video || '/moren_culture-video/moren_culture-video.mp4'}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
                style={{
                  display: 'block',
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none'
                }}
              >
                您的浏览器不支持视频播放。
              </video>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm mb-2">
                    {item.culture?.title || '文化'}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
                </div>
                <button
                  onClick={handleFavorite}
                  className={'p-2 rounded-full transition-colors ' + 
                    (isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                >
                  <svg className="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span>{item.viewCount} 次浏览</span>
                <span>{item._count.favorites} 人收藏</span>
                <span>{item._count.comments} 条评论</span>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">详细介绍</h2>
                <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">用户评论 ({item._count.comments})</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border rounded-md px-2 py-1"
                >
                  <option value="createdAt">最新</option>
                  <option value="_count.likes">最多点赞</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={user ? '写下你的评论...' : '请登录后发表评论'}
                className="input h-24 resize-none"
                disabled={!user}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600 mr-2">评分:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCommentRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={'w-6 h-6 ' + (star <= commentRating ? 'text-yellow-400' : 'text-gray-300')}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !user}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '发表评论'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {item.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无评论，快来发表第一条评论吧！</p>
              ) : (
                item.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Link href={`/users/${comment.user.id}`} className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img 
                              src={comment.user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                              alt="用户头像" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="ml-2 font-medium text-gray-900 hover:text-red-600 transition-colors">
                            {comment.user.nickname || '匿名用户'}
                          </span>
                        </Link>
                      </div>
                      <div className="flex items-center">
                        {comment.rating && (
                          <div className="flex items-center mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={'w-4 h-4 ' + (star <= comment.rating! ? 'text-yellow-400' : 'text-gray-300')}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                        <span className="text-sm text-gray-500 mr-4">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => comment.isLiked ? handleUnlike(comment.id) : handleLike(comment.id)}
                          className="flex items-center text-sm text-gray-500 hover:text-red-600"
                        >
                          <svg
                            className={`w-4 h-4 mr-1 ${comment.isLiked ? 'text-red-600 fill-red-600' : ''}`}
                            fill={comment.isLiked ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {comment._count?.likes || 0}
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        回复 ({comment._count.replies})
                      </button>
                    </div>
                    
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="写下你的回复..."
                          className="input h-20 resize-none w-full"
                          disabled={!user}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={replying || !user || !replyContent.trim()}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {replying ? '回复中...' : '回复'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {comment.replies.length > 0 && (
                      <div className="mt-4 pl-8 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="border-l-2 border-gray-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <Link href={`/users/${reply.user.id}`} className="flex items-center">
                                    <div className="w-6 h-6 rounded-full overflow-hidden">
                                      <img 
                                        src={reply.user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                                        alt="用户头像" 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-900 hover:text-red-600 transition-colors">
                                      {reply.user.nickname || '匿名用户'}
                                    </span>
                                  </Link>
                                </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-3">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => reply.isLiked ? handleUnlike(reply.id) : handleLike(reply.id)}
                                  className="flex items-center text-xs text-gray-500 hover:text-red-600"
                                >
                                  <svg
                                    className={`w-3 h-3 mr-1 ${reply.isLiked ? 'text-red-600 fill-red-600' : ''}`}
                                    fill={reply.isLiked ? 'currentColor' : 'none'}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {reply._count?.likes || 0}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">文化项目信息</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">文化分类</div>
                <div className="text-gray-900">{item.culture?.title || '文化'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">项目名称</div>
                <div className="text-gray-900">{item.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">浏览量</div>
                <div className="text-gray-900">{item.viewCount} 次</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">收藏数</div>
                <div className="text-gray-900">{item._count.favorites} 人</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">评论数</div>
                <div className="text-gray-900">{item._count.comments} 条</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
