'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

interface AttractionFavorite {
  id: number
  createdAt: string
  attraction: {
    id: number
    name: string
    address: string
    category: {
      name: string
    }
  }
}

interface FoodFavorite {
  id: number
  createdAt: string
  food: {
    id: number
    name: string
    description: string
    category: {
      name: string
    }
  }
}

interface CultureFavorite {
  id: number
  createdAt: string
  cultureItem: {
    id: number
    name: string
    description: string
    culture: {
      name: string
    }
  }
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface AttractionsData {
  list: AttractionFavorite[]
  pagination: Pagination
}

interface FoodsData {
  list: FoodFavorite[]
  pagination: Pagination
}

interface CulturesData {
  list: CultureFavorite[]
  pagination: Pagination
}

interface Favorites {
  attractions: AttractionsData
  foods: FoodsData
  cultures: CulturesData
}

export default function UserPage() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading, setUser } = useAuthStore()
  const [favorites, setFavorites] = useState<Favorites>({
    attractions: { list: [], pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 } },
    foods: { list: [], pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 } },
    cultures: { list: [], pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 } }
  })
  const [loading, setLoading] = useState(true)
  const [attractionPage, setAttractionPage] = useState(1)
  const [foodPage, setFoodPage] = useState(1)
  const [culturePage, setCulturePage] = useState(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    avatar: user?.avatar || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login?redirect=/user')
      return
    }
    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, attractionPage, foodPage, culturePage])

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/users/favorites', {
        params: {
          attractionPage,
          foodPage,
          culturePage
        },
        withCredentials: true
      })
      if (res.data.success) {
        setFavorites({
          ...res.data.data,
          cultures: res.data.data.cultures || {
            list: [],
            pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 }
          }
        })
      }
    } catch (error) {
      console.error('获取收藏失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })

      if (res.data.success) {
        setEditForm({ ...editForm, avatar: res.data.data.url })
      }
    } catch (error) {
      console.error('上传头像失败', error)
    } finally {
      setUploadLoading(false)
    }
  }

  // 修改资料弹窗
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const res = await axios.put('/api/users/profile', editForm, { withCredentials: true })
      if (res.data.success) {
        setUser(res.data.data)
        setIsEditModalOpen(false)
        toast.success('修改资料成功')
      }
    } catch (error) {
      console.error('修改资料失败', error)
      toast.error('修改资料失败，请稍后重试')
    } finally {
      setEditLoading(false)
    }
  }

  // 修改密码弹窗
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少为6位')
      return
    }
    
    setPasswordLoading(true)
    try {
      const res = await axios.put('/api/users/password', passwordForm, { withCredentials: true })
      if (res.data.success) {
        setIsPasswordModalOpen(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('修改密码成功')
      }
    } catch (error: any) {
      console.error('修改密码失败', error)
      toast.error(error.response?.data?.message || '修改密码失败，请稍后重试')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <>
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                    alt="头像" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.nickname || '用户'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              </div>
              
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setEditForm({
                      nickname: user.nickname || '',
                      avatar: user.avatar || ''
                    })
                    setIsEditModalOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  修改资料
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  修改密码
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏的景点</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : favorites.attractions.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">暂无收藏的景点</p>
                  <Link href="/attractions" className="btn-primary">
                    去逛逛
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {favorites.attractions.list.map((fav) => (
                      <Link
                        key={fav.id}
                        href={'/attractions/' + fav.attraction.id}
                        className="block border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 hover:text-red-600">
                              {fav.attraction.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {fav.attraction.address}
                            </p>
                            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {fav.attraction.category.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(fav.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* 景点分页 */}
                  {favorites.attractions.pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setAttractionPage(Math.max(1, attractionPage - 1))}
                          disabled={attractionPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一页
                        </button>
                        <span className="text-sm text-gray-600">
                          {favorites.attractions.pagination.page} / {favorites.attractions.pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setAttractionPage(Math.min(favorites.attractions.pagination.totalPages, attractionPage + 1))}
                          disabled={attractionPage === favorites.attractions.pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏的美食</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : favorites.foods.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">暂无收藏的美食</p>
                  <Link href="/food" className="btn-primary">
                    去逛逛
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {favorites.foods.list.map((fav) => (
                      <Link
                        key={fav.id}
                        href={'/food/' + fav.food.id}
                        className="block border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 hover:text-red-600">
                              {fav.food.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {fav.food.description}
                            </p>
                            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {fav.food.category.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(fav.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* 美食分页 */}
                  {favorites.foods.pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setFoodPage(Math.max(1, foodPage - 1))}
                          disabled={foodPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一页
                        </button>
                        <span className="text-sm text-gray-600">
                          {favorites.foods.pagination.page} / {favorites.foods.pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setFoodPage(Math.min(favorites.foods.pagination.totalPages, foodPage + 1))}
                          disabled={foodPage === favorites.foods.pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏的文化</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : favorites.cultures.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">暂无收藏的文化</p>
                  <Link href="/culture" className="btn-primary">
                    去逛逛
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {favorites.cultures.list.map((fav) => (
                      <Link
                        key={fav.id}
                        href={`/culture/${fav.cultureItem.culture.name}/${fav.cultureItem.id}`}
                        className="block border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 hover:text-red-600">
                              {fav.cultureItem.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {fav.cultureItem.description}
                            </p>
                            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {fav.cultureItem.culture.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(fav.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* 文化分页 */}
                  {favorites.cultures.pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCulturePage(Math.max(1, culturePage - 1))}
                          disabled={culturePage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一页
                        </button>
                        <span className="text-sm text-gray-600">
                          {favorites.cultures.pagination.page} / {favorites.cultures.pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setCulturePage(Math.min(favorites.cultures.pagination.totalPages, culturePage + 1))}
                          disabled={culturePage === favorites.cultures.pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 修改资料弹窗 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">修改个人资料</h3>
            <form onSubmit={handleEditSubmit}>
              {/* 头像部分 */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <img 
                      src={editForm.avatar || '/moren_avatar/moren_avatar.jpg'} 
                      alt="头像预览" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadLoading}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadLoading && <p className="text-xs text-gray-500 mt-2">上传中...</p>}
              </div>
              
              {/* 昵称输入 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="请输入昵称"
                />
              </div>
              
              {/* 按钮 */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">修改密码</h3>
            <form onSubmit={handlePasswordSubmit}>
              {/* 当前密码 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="请输入当前密码"
                  required
                />
              </div>
              
              {/* 新密码 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="请输入新密码"
                  required
                />
              </div>
              
              {/* 确认新密码 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              
              {/* 按钮 */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
