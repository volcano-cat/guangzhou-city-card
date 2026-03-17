'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

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

interface Favorites {
  attractions: AttractionsData
  foods: FoodsData
}

export default function UserPage() {
  const router = useRouter()
  const { user, token, logout, isLoading: authLoading } = useAuthStore()
  const [favorites, setFavorites] = useState<Favorites>({
    attractions: { list: [], pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 } },
    foods: { list: [], pagination: { page: 1, pageSize: 3, total: 0, totalPages: 0 } }
  })
  const [loading, setLoading] = useState(true)
  const [attractionPage, setAttractionPage] = useState(1)
  const [foodPage, setFoodPage] = useState(1)

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login?redirect=/user')
      return
    }
    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, attractionPage, foodPage])

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/users/favorites', {
        params: {
          attractionPage,
          foodPage
        },
        headers: { Authorization: 'Bearer ' + token }
      })
      if (res.data.success) {
        setFavorites(res.data.data)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600">
                  {(user.nickname || user.email)[0].toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.nickname || '用户'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
            
            <div className="mt-6 space-y-2">
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
            ) : favorites.attractions.length === 0 ? (
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
            ) : favorites.foods.length === 0 ? (
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
        </div>
      </div>
    </div>
  )
}
