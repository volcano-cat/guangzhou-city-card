'use client'

import { useState, useEffect } from 'react'

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5)

  const fetchNews = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://apis.tianapi.com/areanews/index?key=01e93c6cdaa35f3863863f40b9ca5b38&areaname=广东&word=广州&page=${page}`
      )
      const data = await response.json()
      
      if (data.code === 200 && data.result?.list) {
        setNews(data.result.list)
      } else {
        setError('获取新闻失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          广州近期热门新闻
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <a 
                key={item.id || index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {item.picUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={item.picUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="mr-4">{item.source}</span>
                    <span>{item.ctime}</span>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 分页控件 */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border-t border-b ${page === 1 ? 'border-l rounded-l-md' : ''} ${page === totalPages ? 'border-r rounded-r-md' : 'border-r'} bg-${page === currentPage ? 'red-50' : 'white'} text-${page === currentPage ? 'red-600' : 'gray-500'} text-sm font-medium hover:bg-gray-50`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}