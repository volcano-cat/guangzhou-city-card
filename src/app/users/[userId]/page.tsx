'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

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

interface UserProfile {
  id: number
  nickname: string | null
  avatar: string | null
  email: string
}

interface UserData {
  profile: UserProfile
  favorites: {
    attractions: AttractionsData
    foods: FoodsData
    cultures: CulturesData
  }
}

export default function UserSpacePage() {
  const params = useParams()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attractionPage, setAttractionPage] = useState(1)
  const [foodPage, setFoodPage] = useState(1)
  const [culturePage, setCulturePage] = useState(1)

  useEffect(() => {
    if (params.userId) {
      fetchUserProfile()
    }
  }, [params.userId, attractionPage, foodPage, culturePage])

  const fetchUserProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/api/users/${params.userId}`, {
        params: {
          attractionPage,
          foodPage,
          culturePage
        }
      })
      if (res.data.success) {
        setUserData(res.data.data)
      } else {
        setError('获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      setError('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{error || '用户不存在'}</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          返回
        </button>
      </div>
    )
  }

  const { profile, favorites } = userData

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src={profile.avatar || '/moren_avatar/moren_avatar.jpg'} 
                  alt="头像" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.nickname || '用户'}
              </h2>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏的景点</h3>
            
            {favorites.attractions.list.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无收藏的景点</p>
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏的美食</h3>
            
            {favorites.foods.list.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无收藏的美食</p>
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
            
            {favorites.cultures.list.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无收藏的文化</p>
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
  )
}
