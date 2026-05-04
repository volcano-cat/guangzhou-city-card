'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { toast } from 'sonner'

const deleteOssFile = async (fileUrl: string) => {
  try {
    await axios.post('/api/upload/oss/delete', { fileUrl })
  } catch (error) {
    console.error('删除OSS文件失败:', error)
  }
}

interface Category {
  id: number
  name: string
}

interface Attraction {
  id: number
  name: string
  description: string
  address: string
  images: any
  openTime: string | null
  ticketInfo: string | null
  rating: number | null
  viewCount: number
  category: {
    id: number
    name: string
  }
  status: string
  createdAt: string
}

const AttractionsPage = () => {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    images: [] as string[],
    openTime: '',
    ticketInfo: '',
    categoryId: 0,
    status: 'PUBLISHED'
  })
  const [uploadLoading, setUploadLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  })
  const [searchTerm, setSearchTerm] = useState('')

  // 检查用户是否为管理员
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [user, router, isLoading])

  // 获取景点列表
  useEffect(() => {
    if (user) {
      fetchAttractions()
    }
  }, [pagination.page, pagination.pageSize, user])

  // 获取分类列表
  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchAttractions = async (searchValue = searchTerm) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      })
      if (searchValue) {
        params.append('search', searchValue)
      }
      const res = await axios.get(`/api/admin/attractions?${params.toString()}`)
      if (res.data.success) {
        setAttractions(res.data.data.data)
        setPagination(res.data.data.pagination)
      }
    } catch (error) {
      console.error('获取景点列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchAttractions(searchTerm)
  }

  const handleReset = () => {
    setSearchTerm('')
    setPagination({ ...pagination, page: 1 })
    fetchAttractions('')
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories?type=attraction')
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (error) {
      console.error('获取分类列表失败', error)
    }
  }

  const handleAddAttraction = () => {
    setEditingAttraction(null)
    setFormData({
      name: '',
      description: '',
      address: '',
      images: [],
      openTime: '',
      ticketInfo: '',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      status: 'PUBLISHED'
    })
    setShowAddModal(true)
  }

  const handleEditAttraction = (attraction: Attraction) => {
    setEditingAttraction(attraction)
    setFormData({
      name: attraction.name,
      description: attraction.description,
      address: attraction.address,
      images: Array.isArray(attraction.images) ? attraction.images : [],
      openTime: attraction.openTime || '',
      ticketInfo: attraction.ticketInfo || '',
      categoryId: attraction.category.id,
      status: attraction.status
    })
    setShowAddModal(true)
  }

  const handleDeleteAttraction = async (id: number) => {
    if (confirm('确定要删除这个景点吗？')) {
      try {
        const res = await axios.delete(`/api/admin/attractions/${id}`)
        if (res.data.success) {
          fetchAttractions()
        }
      } catch (error) {
        console.error('删除景点失败', error)
      }
    }
  }

  // 处理图片选择（预览）
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setImageFile(file)
    setFormData({ ...formData, images: [previewUrl] })
  }

  // 上传图片到OSS
  const uploadImageToOss = useCallback(async (): Promise<string | null> => {
    if (!imageFile) return null

    try {
      const res = await axios.post('/api/upload/oss', {
        fileName: imageFile.name,
        contentType: imageFile.type,
      })

      if (!res.data.success) {
        return null
      }

      const { uploadUrl, fileUrl } = res.data.data

      await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type,
        },
      })

      return fileUrl
    } catch (error) {
      console.error('上传图片到OSS失败:', error)
      return null
    }
  }, [imageFile])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let finalImages = formData.images
      const oldImages = editingAttraction?.images || []

      if (imageFile) {
        const ossUrl = await uploadImageToOss()
        if (ossUrl) {
          finalImages = [ossUrl]
          // 删除旧图片
          for (const oldImage of oldImages) {
            if (oldImage.startsWith('https://')) {
              await deleteOssFile(oldImage)
            }
          }
        }
      }

      const submitData = { ...formData, images: finalImages }

      if (editingAttraction) {
        const res = await axios.put(`/api/admin/attractions/${editingAttraction.id}`, submitData)
        if (res.data.success) {
          setShowAddModal(false)
          toast.success('更新景点成功')
          fetchAttractions()
          // 清理预览
          cleanupImagePreview()
        }
      } else {
        const res = await axios.post('/api/admin/attractions', submitData)
        if (res.data.success) {
          setShowAddModal(false)
          toast.success('添加景点成功')
          fetchAttractions()
          // 清理预览
          cleanupImagePreview()
        }
      }
    } catch (error) {
      console.error('保存景点失败', error)
      toast.error('保存景点失败，请稍后重试')
    }
  }

  const cleanupImagePreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setImageFile(null)
  }, [imagePreview])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-4">
          <Link href="/admin" className="text-gray-600 hover:text-red-600 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">景点管理</h1>
          <button
            onClick={handleAddAttraction}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            添加景点
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex-1 min-w-[200px] max-w-md flex gap-2">
            <input
              type="text"
              placeholder="搜索景点（名称）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              搜索
            </button>
            <button 
              onClick={handleReset} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              重置
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  图片
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  景点名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attractions.map((attraction) => (
                <tr key={attraction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={Array.isArray(attraction.images) && attraction.images.length > 0 ? attraction.images[0] : "/moren_attractions-image/moren_attractions-image.jpg"} 
                      alt={attraction.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{attraction.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{attraction.category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{attraction.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attraction.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {attraction.status === 'PUBLISHED' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditAttraction(attraction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteAttraction(attraction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">
                {editingAttraction ? '编辑景点' : '添加景点'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      景点名称
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地址
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      图片
                    </label>
                    <div className="mb-4">
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                          <div className="w-48 h-32 bg-gray-100 rounded-md flex items-center justify-center">
                            <img 
                              src={formData.images.length > 0 ? formData.images[0] : "/moren_attractions-image/moren_attractions-image.jpg"} 
                              alt="景点图片" 
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <label className="absolute bottom-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {uploadLoading && <p className="text-xs text-gray-500 mt-2">上传中...</p>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      开放时间
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={formData.openTime.split('-')[0] || ''}
                        onChange={(e) => {
                          const endTime = formData.openTime.split('-')[1] || '';
                          setFormData({ ...formData, openTime: `${e.target.value}-${endTime}` });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="开始时间"
                        step="60"
                      />
                      <span className="text-gray-500">至</span>
                      <input
                        type="time"
                        value={formData.openTime.split('-')[1] || ''}
                        onChange={(e) => {
                          const startTime = formData.openTime.split('-')[0] || '';
                          setFormData({ ...formData, openTime: `${startTime}-${e.target.value}` });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="结束时间"
                        step="60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      门票信息
                    </label>
                    <input
                      type="text"
                      value={formData.ticketInfo}
                      onChange={(e) => setFormData({ ...formData, ticketInfo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状态
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="PUBLISHED">已发布</option>
                      <option value="DRAFT">草稿</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      // 清理预览资源
                      cleanupImagePreview()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 分页组件 */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            显示 {((pagination.page - 1) * pagination.pageSize) + 1} 到 {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                setPagination({ ...pagination, pageSize: parseInt(e.target.value), page: 1 })
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
            </select>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPagination({ ...pagination, page: 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                首页
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-50">
                {pagination.page}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                下一页
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.totalPages })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                末页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttractionsPage