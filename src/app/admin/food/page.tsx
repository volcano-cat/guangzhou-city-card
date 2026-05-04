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

interface Food {
  id: number
  name: string
  description: string
  images: any
  restaurants: any
  rating: number | null
  viewCount: number
  category: {
    id: number
    name: string
  }
  status: string
  createdAt: string
}

const FoodPage = () => {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [] as string[],
    restaurants: [] as {name: string, address: string}[],
    categoryId: 0,
    status: 'PUBLISHED'
  })
  const [newRestaurant, setNewRestaurant] = useState({ name: '', address: '' })
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false)
  const [mapSearchKeyword, setMapSearchKeyword] = useState('')
  const [mapSearchResults, setMapSearchResults] = useState<{name: string, address: string}[]>([])
  const [mapSearchLoading, setMapSearchLoading] = useState(false)
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

  // 获取美食列表
  useEffect(() => {
    if (user) {
      fetchFoods()
    }
  }, [pagination.page, pagination.pageSize, user])

  // 获取分类列表
  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchFoods = async (searchValue = searchTerm) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      })
      if (searchValue) {
        params.append('search', searchValue)
      }
      const res = await axios.get(`/api/admin/food?${params.toString()}`)
      if (res.data.success) {
        setFoods(res.data.data.data)
        setPagination(res.data.data.pagination)
      }
    } catch (error) {
      console.error('获取美食列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchFoods(searchTerm)
  }

  const handleReset = () => {
    setSearchTerm('')
    setPagination({ ...pagination, page: 1 })
    fetchFoods('')
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories?type=food')
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (error) {
      console.error('获取分类列表失败', error)
    }
  }

  const handleAddFood = () => {
    setEditingFood(null)
    setFormData({
      name: '',
      description: '',
      images: [],
      restaurants: [],
      categoryId: categories.length > 0 ? categories[0].id : 0,
      status: 'PUBLISHED'
    })
    // 清空新餐厅数据
    setNewRestaurant({ name: '', address: '' })
    setShowAddModal(true)
  }

  const handleEditFood = (food: Food) => {
    setEditingFood(food)
    // 处理餐厅数据，确保它是数组格式
    let restaurantsData = []
    if (food.restaurants) {
      if (typeof food.restaurants === 'string') {
        try {
          restaurantsData = JSON.parse(food.restaurants)
        } catch {
          restaurantsData = []
        }
      } else if (Array.isArray(food.restaurants)) {
        restaurantsData = food.restaurants
      }
    }
    setFormData({
      name: food.name,
      description: food.description,
      images: Array.isArray(food.images) ? food.images : [],
      restaurants: restaurantsData,
      categoryId: food.category.id,
      status: food.status
    })
    // 清空新餐厅数据
    setNewRestaurant({ name: '', address: '' })
    setShowAddModal(true)
  }

  const handleDeleteFood = async (id: number) => {
    if (confirm('确定要删除这个美食吗？')) {
      try {
        const res = await axios.delete(`/api/admin/food/${id}`)
        if (res.data.success) {
          fetchFoods()
        }
      } catch (error) {
        console.error('删除美食失败', error)
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

  // 清理预览资源
  const cleanupImagePreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setImageFile(null)
  }, [imagePreview])

  // 处理添加餐厅
  const handleAddRestaurant = () => {
    if (newRestaurant.name && newRestaurant.address) {
      // 基本地址验证
      if (newRestaurant.address.length < 5) {
        toast.error('请输入有效的地址，地址长度至少为5个字符');
        return;
      }
      setFormData({
        ...formData,
        restaurants: [...formData.restaurants, { ...newRestaurant }]
      })
      setNewRestaurant({ name: '', address: '' })
      setShowAddRestaurantModal(false)
      // 显示添加成功提示
      toast.success('添加餐厅成功')
    } else {
      toast.error('请选择餐厅');
    }
  }

  // 打开添加餐厅弹窗
  const openAddRestaurantModal = () => {
    setShowAddRestaurantModal(true)
    setMapSearchKeyword('')
    setMapSearchResults([])
  }

  // 关闭添加餐厅弹窗并清空选中的餐厅
  const closeAddRestaurantModal = () => {
    setShowAddRestaurantModal(false)
    setNewRestaurant({ name: '', address: '' })
    setMapSearchKeyword('')
    setMapSearchResults([])
  }

  // 高德地图API搜索餐厅
  const handleMapSearch = async () => {
    if (!mapSearchKeyword) {
      toast.error('请输入搜索关键词');
      return;
    }

    setMapSearchLoading(true);
    try {
      // 使用用户提供的高德地图API密钥
      const apiKey = '05092903c58df9f2785f8478d5acaf60';
      const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(mapSearchKeyword)}&types=050100&city=广州&output=json&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // 打印返回数据，方便调试
      console.log('高德地图API返回数据:', data);
      
      if (data.status === '1' && data.pois && data.pois.length > 0) {
        const results = data.pois.map((poi: any) => ({
          name: poi.name,
          address: poi.address || poi.location || '地址信息缺失'
        }));
        setMapSearchResults(results);
      } else {
        setMapSearchResults([]);
        // 显示具体的错误信息
        if (data.info) {
          toast.error(`搜索失败: ${data.info}`);
        } else if (data.pois && data.pois.length === 0) {
          toast.error('未找到相关餐厅');
        } else {
          toast.error('搜索失败，请稍后重试');
        }
      }
    } catch (error) {
      console.error('地图搜索失败', error);
      setMapSearchResults([]);
      toast.error('搜索失败，请稍后重试');
    } finally {
      setMapSearchLoading(false);
    }
  }

  // 从地图搜索结果中选择餐厅
  const handleSelectRestaurant = (restaurant: {name: string, address: string}) => {
    setNewRestaurant(restaurant);
    setMapSearchResults([]);
    setMapSearchKeyword('');
  }

  // 处理删除餐厅
  const handleRemoveRestaurant = (index: number) => {
    const updatedRestaurants = [...formData.restaurants]
    updatedRestaurants.splice(index, 1)
    setFormData({
      ...formData,
      restaurants: updatedRestaurants
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let finalImages = formData.images
      const oldImages = editingFood?.images || []

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

      if (editingFood) {
        const res = await axios.put(`/api/admin/food/${editingFood.id}`, submitData)
        if (res.data.success) {
          setShowAddModal(false)
          toast.success('更新美食成功')
          fetchFoods()
          cleanupImagePreview()
        }
      } else {
        const res = await axios.post('/api/admin/food', submitData)
        if (res.data.success) {
          setShowAddModal(false)
          toast.success('添加美食成功')
          fetchFoods()
          cleanupImagePreview()
        }
      }
    } catch (error) {
      console.error('保存美食失败', error)
      toast.error('保存美食失败，请稍后重试')
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
          <h1 className="text-2xl font-bold text-gray-900">美食管理</h1>
          <button
            onClick={handleAddFood}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            添加美食
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex-1 min-w-[200px] max-w-md flex gap-2">
            <input
              type="text"
              placeholder="搜索美食（名称）"
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
                  美食名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
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
              {foods.map((food) => (
                <tr key={food.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={Array.isArray(food.images) && food.images.length > 0 ? food.images[0] : "/moren_attractions-image/moren_attractions-image.jpg"} 
                      alt={food.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{food.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{food.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      food.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {food.status === 'PUBLISHED' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFood(food)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
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
                {editingFood ? '编辑美食' : '添加美食'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      美食名称
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
                      图片
                    </label>
                    <div className="mb-4">
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                          <div className="w-48 h-32 bg-gray-100 rounded-md flex items-center justify-center">
                            <img 
                              src={formData.images.length > 0 ? formData.images[0] : "/moren_attractions-image/moren_attractions-image.jpg"} 
                              alt="美食图片" 
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
                      推荐餐厅
                    </label>
                    <div className="mb-4">
                      {/* 现有餐厅列表 */}
                      {formData.restaurants.map((restaurant, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2 p-2 border border-gray-200 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-sm text-gray-600">{restaurant.address}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRestaurant(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                      
                      {/* 添加新餐厅按钮 */}
                      <button
                        type="button"
                        onClick={openAddRestaurantModal}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        添加餐厅
                      </button>
                    </div>
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
                      // 清空新添加的餐厅信息
                      setNewRestaurant({ name: '', address: '' })
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
        
        {/* 添加餐厅弹窗 */}
        {showAddRestaurantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">添加餐厅</h2>
              
              {/* 地图搜索界面 */}
              <div className="p-3 border border-gray-200 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-2">高德地图搜索</h5>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={mapSearchKeyword}
                    onChange={(e) => setMapSearchKeyword(e.target.value)}
                    placeholder="输入餐厅名称或关键词"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    disabled={mapSearchLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
                  >
                    {mapSearchLoading ? '搜索中...' : '搜索'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {mapSearchResults.length > 0 ? (
                    mapSearchResults.map((restaurant, index) => (
                      <div 
                        key={index} 
                        className="p-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectRestaurant(restaurant)}
                      >
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-gray-600">{restaurant.address}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      {mapSearchLoading ? '搜索中...' : '暂无搜索结果'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 选中的餐厅信息 */}
              {newRestaurant.name && (
                <div className="mt-4 p-3 border border-green-200 bg-green-50 rounded-md">
                  <h5 className="text-sm font-medium text-green-700 mb-2">已选中餐厅</h5>
                  <div className="font-medium">{newRestaurant.name}</div>
                  <div className="text-sm text-gray-600">{newRestaurant.address}</div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeAddRestaurantModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddRestaurant}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  添加餐厅
                </button>
              </div>
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

export default FoodPage