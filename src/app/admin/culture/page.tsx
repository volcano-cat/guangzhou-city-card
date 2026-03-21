'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

interface Culture {
  id: number
  name: string
  description: string
  icon: string
  image: string | null
  _count: {
    items: number
  }
  status: string
  createdAt: string
}

interface CultureItem {
  id: number
  name: string
  description: string
  image: string | null
  viewCount: number
  status: string
  createdAt: string
}

const CulturePage = () => {
  const { user, token, isLoading } = useAuthStore()
  const router = useRouter()
  const [cultures, setCultures] = useState<Culture[]>([])
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null)
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCultureModal, setShowCultureModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingCulture, setEditingCulture] = useState<Culture | null>(null)
  const [editingItem, setEditingItem] = useState<CultureItem | null>(null)
  const [cultureFormData, setCultureFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    status: 'PUBLISHED'
  })
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'PUBLISHED'
  })
  const [uploadLoading, setUploadLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'cultures' | 'items'>('cultures')
  const [culturePagination, setCulturePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  })
  const [itemPagination, setItemPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  })

  // 检查用户是否为管理员
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [user, router, isLoading])

  // 获取文化分类列表
  useEffect(() => {
    if (token) {
      fetchCultures()
    }
  }, [token, culturePagination.page, culturePagination.pageSize])

  // 获取文化项目列表
  useEffect(() => {
    if (token && selectedCulture) {
      fetchCultureItems(selectedCulture.id)
    }
  }, [token, selectedCulture, itemPagination.page, itemPagination.pageSize])

  // 切换标签页时重置分页
  useEffect(() => {
    if (activeTab === 'cultures') {
      setCulturePagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
    } else if (activeTab === 'items' && selectedCulture) {
      setItemPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
    }
  }, [activeTab, selectedCulture])

  const fetchCultures = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/culture?page=${culturePagination.page}&pageSize=${culturePagination.pageSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setCultures(res.data.data.list)
        setCulturePagination({
          page: res.data.data.pagination.page,
          pageSize: res.data.data.pagination.pageSize,
          total: res.data.data.pagination.total,
          totalPages: res.data.data.pagination.totalPages
        })
      }
    } catch (error) {
      console.error('获取文化列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCultureItems = async (cultureId: number) => {
    try {
      const res = await axios.get(`/api/admin/culture/${cultureId}/items?page=${itemPagination.page}&pageSize=${itemPagination.pageSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setCultureItems(res.data.data.list)
        setItemPagination({
          page: res.data.data.pagination.page,
          pageSize: res.data.data.pagination.pageSize,
          total: res.data.data.pagination.total,
          totalPages: res.data.data.pagination.totalPages
        })
      }
    } catch (error) {
      console.error('获取文化项目列表失败', error)
    }
  }

  const handleAddCulture = () => {
    setEditingCulture(null)
    setCultureFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      status: 'PUBLISHED'
    })
    setShowCultureModal(true)
  }

  const handleEditCulture = (culture: Culture) => {
    setEditingCulture(culture)
    setCultureFormData({
      name: culture.name,
      description: culture.description,
      icon: culture.icon,
      image: culture.image || '',
      status: culture.status
    })
    setShowCultureModal(true)
  }

  const handleDeleteCulture = async (id: number) => {
    if (confirm('确定要删除这个文化分类吗？相关的所有项目也会被删除。')) {
      try {
        const res = await axios.delete(`/api/admin/culture/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          // 重新获取列表
          setCulturePagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
          fetchCultures()
          // 清除选中的分类
          setSelectedCulture(null)
          setCultureItems([])
          toast.success('删除文化分类成功')
        }
      } catch (error) {
        console.error('删除文化分类失败', error)
        toast.error('删除文化分类失败')
      }
    }
  }

  const handleAddItem = () => {
    if (!selectedCulture) {
      toast.error('请先选择一个文化分类')
      return
    }
    setEditingItem(null)
    setItemFormData({
      name: '',
      description: '',
      image: '',
      status: 'PUBLISHED'
    })
    setShowItemModal(true)
  }

  const handleEditItem = (item: CultureItem) => {
    setEditingItem(item)
    setItemFormData({
      name: item.name,
      description: item.description,
      image: item.image || '',
      status: item.status
    })
    setShowItemModal(true)
  }

  const handleDeleteItem = async (id: number) => {
    if (confirm('确定要删除这个文化项目吗？')) {
      try {
        const res = await axios.delete(`/api/admin/culture/${selectedCulture?.id}/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          // 重新获取列表
          setItemPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
          fetchCultureItems(selectedCulture!.id)
          toast.success('删除文化项目成功')
        }
      } catch (error) {
        console.error('删除文化项目失败', error)
        toast.error('删除文化项目失败')
      }
    }
  }

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'culture' | 'item') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadLoading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await axios.post('/api/upload/culture-image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token
        }
      })

      if (res.data.success) {
        if (type === 'culture') {
          setCultureFormData({ ...cultureFormData, image: res.data.data.url })
        } else {
          setItemFormData({ ...itemFormData, image: res.data.data.url })
        }
      }
    } catch (error) {
      console.error('上传图片失败', error)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleCultureSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCulture) {
        const res = await axios.put(`/api/admin/culture/${editingCulture.id}`, cultureFormData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setShowCultureModal(false)
          toast.success('更新文化分类成功')
          fetchCultures()
        }
      } else {
        const res = await axios.post('/api/admin/culture', cultureFormData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setShowCultureModal(false)
          toast.success('添加文化分类成功')
          // 重新获取列表
          setCulturePagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
          fetchCultures()
        }
      }
    } catch (error) {
      console.error('保存文化分类失败', error)
      toast.error('保存文化分类失败，请稍后重试')
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCulture) return

    try {
      if (editingItem) {
        const res = await axios.put(`/api/admin/culture/${selectedCulture.id}/items/${editingItem.id}`, itemFormData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setShowItemModal(false)
          toast.success('更新文化项目成功')
          fetchCultureItems(selectedCulture.id)
        }
      } else {
        const res = await axios.post(`/api/admin/culture/${selectedCulture.id}/items`, itemFormData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setShowItemModal(false)
          toast.success('添加文化项目成功')
          // 重新获取列表
          setItemPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
          fetchCultureItems(selectedCulture.id)
        }
      }
    } catch (error) {
      console.error('保存文化项目失败', error)
      toast.error('保存文化项目失败，请稍后重试')
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
          <h1 className="text-2xl font-bold text-gray-900">文化管理</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('cultures')}
              className={`px-4 py-2 rounded-md ${activeTab === 'cultures' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              文化分类
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-md ${activeTab === 'items' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              文化项目
            </button>
          </div>
        </div>

        {activeTab === 'cultures' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-700">文化分类列表</h2>
              <button
                onClick={handleAddCulture}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                添加文化分类
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      图标
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      项目数
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
                  {cultures.map((culture) => (
                    <tr key={culture.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-2xl">{culture.icon}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{culture.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{culture.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{culture._count.items}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          culture.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {culture.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCulture(culture)
                            setActiveTab('items')
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          管理项目
                        </button>
                        <button
                          onClick={() => handleEditCulture(culture)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteCulture(culture.id)}
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

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                显示 {((culturePagination.page - 1) * culturePagination.pageSize) + 1} 到 {Math.min(culturePagination.page * culturePagination.pageSize, culturePagination.total)} 条，共 {culturePagination.total} 条
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={culturePagination.pageSize}
                  onChange={(e) => {
                    setCulturePagination({ ...culturePagination, pageSize: parseInt(e.target.value), page: 1 })
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="10">10条/页</option>
                  <option value="20">20条/页</option>
                  <option value="50">50条/页</option>
                </select>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCulturePagination({ ...culturePagination, page: 1 })}
                    disabled={culturePagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    首页
                  </button>
                  <button
                    onClick={() => setCulturePagination({ ...culturePagination, page: culturePagination.page - 1 })}
                    disabled={culturePagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-50">
                    {culturePagination.page}
                  </span>
                  <button
                    onClick={() => setCulturePagination({ ...culturePagination, page: culturePagination.page + 1 })}
                    disabled={culturePagination.page === culturePagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    下一页
                  </button>
                  <button
                    onClick={() => setCulturePagination({ ...culturePagination, page: culturePagination.totalPages })}
                    disabled={culturePagination.page === culturePagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    末页
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  {selectedCulture ? `${selectedCulture.name} - 项目列表` : '请选择文化分类'}
                </h2>
                {selectedCulture && (
                  <button
                    onClick={() => setSelectedCulture(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    清除选择
                  </button>
                )}
              </div>
              <button
                onClick={handleAddItem}
                disabled={!selectedCulture}
                className={`px-4 py-2 rounded-md ${
                  selectedCulture 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                添加文化项目
              </button>
            </div>

            {!selectedCulture ? (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <p className="text-gray-500">请先选择一个文化分类来管理其项目</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cultures.map((culture) => (
                    <button
                      key={culture.id}
                      onClick={() => {
                        setSelectedCulture(culture)
                        setItemPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-red-600 hover:shadow-md transition-all"
                    >
                      <div className="text-3xl mb-2">{culture.icon}</div>
                      <div className="font-medium text-gray-900">{culture.name}</div>
                      <div className="text-sm text-gray-500">{culture._count.items} 个项目</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          图片
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          项目名称
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          描述
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          浏览量
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
                      {cultureItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img 
                              src={item.image || '/moren_culture-image/moren_attractions-image.jpg'} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.viewCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'PUBLISHED' ? '已发布' : '草稿'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cultureItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无文化项目，点击"添加文化项目"创建
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    显示 {((itemPagination.page - 1) * itemPagination.pageSize) + 1} 到 {Math.min(itemPagination.page * itemPagination.pageSize, itemPagination.total)} 条，共 {itemPagination.total} 条
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={itemPagination.pageSize}
                      onChange={(e) => {
                        setItemPagination({ ...itemPagination, pageSize: parseInt(e.target.value), page: 1 })
                      }}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="10">10条/页</option>
                      <option value="20">20条/页</option>
                      <option value="50">50条/页</option>
                    </select>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setItemPagination({ ...itemPagination, page: 1 })}
                        disabled={itemPagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        首页
                      </button>
                      <button
                        onClick={() => setItemPagination({ ...itemPagination, page: itemPagination.page - 1 })}
                        disabled={itemPagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        上一页
                      </button>
                      <span className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-50">
                        {itemPagination.page}
                      </span>
                      <button
                        onClick={() => setItemPagination({ ...itemPagination, page: itemPagination.page + 1 })}
                        disabled={itemPagination.page === itemPagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        下一页
                      </button>
                      <button
                        onClick={() => setItemPagination({ ...itemPagination, page: itemPagination.totalPages })}
                        disabled={itemPagination.page === itemPagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        末页
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* 文化分类编辑弹窗 */}
        {showCultureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingCulture ? '编辑文化分类' : '添加文化分类'}
              </h2>
              <form onSubmit={handleCultureSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类名称
                    </label>
                    <input
                      type="text"
                      value={cultureFormData.name}
                      onChange={(e) => setCultureFormData({ ...cultureFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      图标 (Emoji)
                    </label>
                    <input
                      type="text"
                      value={cultureFormData.icon}
                      onChange={(e) => setCultureFormData({ ...cultureFormData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="例如: 🏮"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={cultureFormData.description}
                      onChange={(e) => setCultureFormData({ ...cultureFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      封面图片
                    </label>
                    <div className="mb-4">
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                          <div className="w-48 h-32 bg-gray-100 rounded-md flex items-center justify-center">
                            <img 
                              src={cultureFormData.image || '/moren_culture-image/moren_attractions-image.jpg'} 
                              alt="文化分类图片" 
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
                              onChange={(e) => handleImageUpload(e, 'culture')}
                              disabled={uploadLoading}
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
                      状态
                    </label>
                    <select
                      value={cultureFormData.status}
                      onChange={(e) => setCultureFormData({ ...cultureFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="PUBLISHED">已发布</option>
                      <option value="DRAFT">草稿</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCultureModal(false)}
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

        {/* 文化项目编辑弹窗 */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? '编辑文化项目' : '添加文化项目'}
              </h2>
              <form onSubmit={handleItemSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      项目名称
                    </label>
                    <input
                      type="text"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={itemFormData.description}
                      onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
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
                              src={itemFormData.image || '/moren_culture-image/moren_attractions-image.jpg'} 
                              alt="文化项目图片" 
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
                              onChange={(e) => handleImageUpload(e, 'item')}
                              disabled={uploadLoading}
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
                      状态
                    </label>
                    <select
                      value={itemFormData.status}
                      onChange={(e) => setItemFormData({ ...itemFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="PUBLISHED">已发布</option>
                      <option value="DRAFT">草稿</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
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
      </div>
    </div>
  )
}

export default CulturePage
