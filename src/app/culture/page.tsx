'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Culture {
  id: number
  name: string
  description: string
  icon: string
  image: string | null
  _count: {
    items: number
  }
}

export default function CulturePage() {
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCultures()
  }, [page])

  const fetchCultures = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/culture?page=${page}&pageSize=6`)
      if (res.data.success) {
        setCultures(res.data.data.list)
        setTotalPages(res.data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('获取文化列表失败', error)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">广州文化</h1>
        <p className="text-gray-600 mt-2">
          探索岭南文化的深厚底蕴
        </p>
      </div>

      {cultures.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无文化数据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultures.map((culture) => (
              <a 
                key={culture.id} 
                href={`/culture/${culture.id}`}
                className="card p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-5xl mb-4">{culture.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{culture.name}</h3>
                <p className="text-gray-600 mb-4">{culture.description}</p>
                <div className="text-sm text-gray-500">
                  {culture._count.items} 个项目
                </div>
              </a>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  下一页
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">广州历史</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            广州有着2200多年的建城历史，是中国历史文化名城之一。从秦朝设立南海郡开始，
            广州就一直是岭南地区的政治、经济、文化中心。
          </p>
          <p className="mt-4">
            作为海上丝绸之路的起点，广州自古就是中国对外贸易的重要港口。
            唐宋时期，广州已是世界著名的贸易大港，来自世界各地的商人云集于此。
          </p>
          <p className="mt-4">
            近代以来，广州更是中国革命的策源地，孙中山先生在此创建了中国同盟会，
            发动了多次起义，为推翻封建帝制、建立民主共和作出了重要贡献。
          </p>
        </div>
      </div>
    </div>
  )
}
