'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

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

interface Restaurant {
  name: string
  address: string
}

interface Food {
  id: number
  name: string
  description: string
  images: string[] | null
  restaurants: Restaurant[] | string | null
  rating: number | null
  viewCount: number
  category: {
    id: number
    name: string
  }
  comments: Comment[]
  _count: {
    favorites: number
    comments: number
  }
  isFavorited: boolean
}

export default function FoodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [food, setFood] = useState<Food | null>(null)
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
    if (params.id) {
      fetchFood()
    }
  }, [params.id, sortBy, sortOrder])



  const fetchFood = async () => {
    setLoading(true)
    try {
      const headers: any = {}
      if (token) {
        headers['Authorization'] = 'Bearer ' + token
      }
      const res = await axios.get('/api/foods/' + params.id, { headers })
      if (res.data.success) {
        let sortedComments = [...res.data.data.comments]
        
        // 根据排序参数进行前端排序
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
        
        // 更新状态，使用排序后的评论
        setFood({
          ...res.data.data,
          comments: sortedComments
        })
        setIsFavorited(res.data.data.isFavorited)
      }
    } catch (error) {
      console.error('获取美食详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      router.push('/login?redirect=/food/' + params.id)
      return
    }

    try {
      if (isFavorited) {
        await axios.delete('/api/foods/' + params.id + '/favorite', {
          headers: { Authorization: 'Bearer ' + token }
        })
        setIsFavorited(false)
      } else {
        await axios.post('/api/foods/' + params.id + '/favorite', {}, {
          headers: { Authorization: 'Bearer ' + token }
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('操作失败', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      router.push('/login?redirect=/food/' + params.id)
      return
    }

    if (!commentContent.trim()) {
      alert('请输入评论内容')
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post(
        '/api/foods/' + params.id + '/comments',
        { content: commentContent, rating: commentRating },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      if (res.data.success) {
        setCommentContent('')
        fetchFood()
      }
    } catch (error) {
      console.error('评论失败', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: number) => {
    if (!user) {
      router.push('/login?redirect=/food/' + params.id)
      return
    }

    if (!replyContent.trim()) {
      alert('请输入回复内容')
      return
    }

    setReplying(true)
    try {
      const res = await axios.post(
        '/api/foods/' + params.id + '/comments',
        { content: replyContent, parentId },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      if (res.data.success) {
        setReplyContent('')
        setReplyingTo(null)
        fetchFood()
      }
    } catch (error) {
      console.error('回复失败', error)
    } finally {
      setReplying(false)
    }
  }

  const handleLike = async (commentId: number) => {
    if (!user) {
      router.push('/login?redirect=/food/' + params.id)
      return
    }

    try {
      const res = await axios.post(
        '/api/foods/' + params.id + '/comments/' + commentId + '/like',
        {},
        { headers: { Authorization: 'Bearer ' + token } }
      )
      if (res.data.success) {
        fetchFood()
      }
    } catch (error) {
      console.error('点赞失败', error)
    }
  }

  const handleUnlike = async (commentId: number) => {
    if (!user) {
      router.push('/login?redirect=/food/' + params.id)
      return
    }

    try {
      const res = await axios.delete(
        '/api/foods/' + params.id + '/comments/' + commentId + '/like',
        { headers: { Authorization: 'Bearer ' + token } }
      )
      if (res.data.success) {
        fetchFood()
      }
    } catch (error) {
      console.error('取消点赞失败', error)
    }
  }

  const parseRestaurants = (restaurants: Restaurant[] | string | null): Restaurant[] => {
    if (!restaurants) return []
    if (typeof restaurants === "string") {
      try {
        return JSON.parse(restaurants)
      } catch {
        return []
      }
    }
    return restaurants
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!food) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">美食不存在</h1>
      </div>
    )
  }

  const restaurantList = parseRestaurants(food.restaurants)

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
          返回
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 md:h-96 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-6xl">🍜</span>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm mb-2">
                    {food.category.name}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{food.name}</h1>
                </div>
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg 
                    className="w-6 h-6" 
                    fill={isFavorited ? 'currentColor' : 'none'} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {food.rating || '暂无评分'}
                </span>
                <span>{food.viewCount} 次浏览</span>
                <span>{food._count.favorites} 人收藏</span>
                <span>{food._count.comments} 条评论</span>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">美食介绍</h2>
                <p className="text-gray-600 whitespace-pre-line">{food.description}</p>
              </div>

              {/* 推荐餐厅 */}
              {restaurantList.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">📍 推荐餐厅</h2>
                  <div className="space-y-3">
                    {restaurantList.map((restaurant, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <a 
                            href={`/map?type=restaurant&name=${encodeURIComponent(restaurant.name)}&address=${encodeURIComponent(restaurant.address)}`}
                            className="flex-1 font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            <div className="mb-1">{restaurant.name}</div>
                            <div className="text-sm">{restaurant.address}</div>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">用户评论 ({food._count.comments})</h2>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
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
                        className={`w-6 h-6 ${
                          star <= commentRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
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
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '发表评论'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {food.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无评论，快来发表第一条评论吧！</p>
              ) : (
                food.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={comment.user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                            alt="用户头像" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="ml-2 font-medium text-gray-900">
                          {comment.user.nickname || '匿名用户'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {comment.rating && (
                          <div className="flex items-center mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= comment.rating! ? 'text-yellow-400' : 'text-gray-300'
                                }`}
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
                        回复 ({comment._count?.replies || 0})
                      </button>
                    </div>
                    
                    {/* 回复输入框 */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="写下你的回复..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          rows={3}
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
                    
                    {/* 回复列表 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-8 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="border-l-2 border-gray-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                  <img 
                                    src={reply.user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                                    alt="用户头像" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {reply.user.nickname || '匿名用户'}
                                </span>
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
            <h3 className="text-lg font-semibold mb-4">美食信息</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">分类</div>
                <div className="text-gray-900">{food.category.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">评分</div>
                <div className="text-gray-900">{food.rating || '暂无评分'}</div>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
