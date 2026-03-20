'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import * as echarts from 'echarts'

// 模拟数据类型
interface TourismData {
  month: string
  visitors: number
}

interface CategoryData {
  name: string
  value: number
}

interface AttractionRank {
  id: number
  name: string
  viewCount: number
  favorites: number
}

export default function AnalyticsPage() {
  const [tourismData, setTourismData] = useState<TourismData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [topAttractions, setTopAttractions] = useState<AttractionRank[]>([])
  const [loading, setLoading] = useState(true)
  
  // ECharts 实例引用
  const visitorsChartRef = useRef<HTMLDivElement>(null)
  const categoryChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 模拟数据获取
    fetchAnalyticsData()
  }, [])

  useEffect(() => {
    if (!loading) {
      initCharts()
    }
  }, [loading, tourismData, categoryData])

  const fetchAnalyticsData = async () => {
    try {
      // 这里应该从 API 获取真实数据，现在使用模拟数据
      // const res = await axios.get('/api/analytics')
      // const data = res.data.data

      // 模拟旅游数据
      const mockTourismData: TourismData[] = [
        { month: '1月', visitors: 12000 },
        { month: '2月', visitors: 19000 },
        { month: '3月', visitors: 30000 },
        { month: '4月', visitors: 25000 },
        { month: '5月', visitors: 35000 },
        { month: '6月', visitors: 28000 },
        { month: '7月', visitors: 40000 },
        { month: '8月', visitors: 45000 },
        { month: '9月', visitors: 32000 },
        { month: '10月', visitors: 48000 },
        { month: '11月', visitors: 30000 },
        { month: '12月', visitors: 20000 },
      ]

      // 模拟分类数据
      const mockCategoryData: CategoryData[] = [
        { name: '历史古迹', value: 35 },
        { name: '自然风光', value: 25 },
        { name: '现代地标', value: 20 },
        { name: '文化艺术', value: 15 },
        { name: '美食体验', value: 5 },
      ]

      // 模拟热门景点
      const mockTopAttractions: AttractionRank[] = [
        { id: 1, name: '广州塔', viewCount: 120000, favorites: 8500 },
        { id: 2, name: '白云山', viewCount: 95000, favorites: 7200 },
        { id: 3, name: '陈家祠', viewCount: 88000, favorites: 6800 },
        { id: 4, name: '沙面', viewCount: 82000, favorites: 6500 },
        { id: 5, name: '越秀公园', viewCount: 75000, favorites: 5800 },
      ]

      setTourismData(mockTourismData)
      setCategoryData(mockCategoryData)
      setTopAttractions(mockTopAttractions)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const initCharts = () => {
    // 确保 ECharts 已加载
    if (typeof window !== 'undefined' && echarts) {
      // 初始化游客量图表
      if (visitorsChartRef.current) {
        const visitorsChart = echarts.init(visitorsChartRef.current)
        const visitorsOption = {
          title: {
            text: '广州旅游月度游客量趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: tourismData.map(item => item.month)
          },
          yAxis: {
            type: 'value',
            name: '游客量'
          },
          series: [{
            data: tourismData.map(item => item.visitors),
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#e53e3e'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(229, 62, 62, 0.3)'
                }, {
                  offset: 1, color: 'rgba(229, 62, 62, 0.1)'
                }]
              }
            }
          }]
        }
        visitorsChart.setOption(visitorsOption)

        // 响应式调整
        window.addEventListener('resize', () => {
          visitorsChart.resize()
        })
      }

      // 初始化分类占比图表
      if (categoryChartRef.current) {
        const categoryChart = echarts.init(categoryChartRef.current)
        const categoryOption = {
          title: {
            text: '广州景点分类占比',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          series: [{
            name: '景点分类',
            type: 'pie',
            radius: '60%',
            data: categoryData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            }
          }]
        }
        categoryChart.setOption(categoryOption)

        // 响应式调整
        window.addEventListener('resize', () => {
          categoryChart.resize()
        })
      }
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
        <h1 className="text-3xl font-bold text-gray-900">广州旅游数据分析</h1>
        <p className="text-gray-600 mt-2">
          基于广州城市名片系统的旅游数据可视化分析
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 游客量趋势图表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div ref={visitorsChartRef} className="w-full h-80"></div>
        </div>

        {/* 景点分类占比图表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div ref={categoryChartRef} className="w-full h-80"></div>
        </div>
      </div>

      {/* 热门景点排名 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">热门景点排名</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  景点名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  浏览量
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  收藏数
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topAttractions.map((attraction, index) => (
                <tr key={attraction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attraction.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attraction.viewCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attraction.favorites.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {tourismData.reduce((sum, item) => sum + item.visitors, 0).toLocaleString()}
          </div>
          <div className="text-gray-600">年度总游客量</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {topAttractions.length}
          </div>
          <div className="text-gray-600">热门景点数量</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {categoryData.length}
          </div>
          <div className="text-gray-600">景点分类数量</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {topAttractions.reduce((sum, item) => sum + item.favorites, 0).toLocaleString()}
          </div>
          <div className="text-gray-600">总收藏数</div>
        </div>
      </div>
    </div>
  )
}
