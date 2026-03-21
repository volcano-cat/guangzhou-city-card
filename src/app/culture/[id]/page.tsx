'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface CultureItem {
  id: number
  name: string
  description: string
  image: string
  viewCount: number
  _count: {
    favorites: number
    comments: number
  }
}

interface Culture {
  id: number
  name: string
  icon: string
  description: string
  image: string
  items: CultureItem[]
}

export default function CultureListPage() {
  const params = useParams()
  const router = useRouter()
  const [culture, setCulture] = useState<Culture | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCulture()
    }
  }, [params.id])

  const fetchCulture = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/culture/${params.id}`)
      if (res.data.success) {
        setCulture(res.data.data)
      }
    } catch (error) {
      console.error('获取文化分类详情失败', error)
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

  if (!culture) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">文化内容不存在</h1>
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
          返回文化列表
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center">
          <div className="text-4xl mr-4">{culture.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{culture.name}</h1>
            <p className="text-gray-600 mt-2">{culture.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {culture.items.map((item) => (
          <Link
            key={item.id}
            href={`/culture/${params.id}/${item.id}`}
            className="card group"
          >
            <div className="relative h-48 bg-gray-200">
              <img
                src={item.image || '/moren_culture-image/moren_attractions-image.jpg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {item.viewCount}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {item._count.favorites}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {culture.items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无相关内容</p>
        </div>
      )}
    </div>
  )
}