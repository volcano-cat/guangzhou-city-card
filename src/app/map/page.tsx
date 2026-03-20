'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// 全局类型声明
declare global {
  interface Window {
    AMap: any
  }
}

export default function MapPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null) // 持久化地图实例

  // 从路由获取参数
  const type = searchParams.get('type')
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  useEffect(() => {
    // 1. 基础参数校验
    if (!address || !name) {
      setError('缺少名称或地址参数')
      setLoading(false)
      return
    }

    const mapContainer = mapContainerRef.current
    if (!mapContainer || !window.AMap) {
      setError(!mapContainer ? '地图容器不存在' : '高德地图API加载失败')
      setLoading(false)
      return
    }

    // 2. 初始化地图
    const map = new window.AMap.Map(mapContainer, {
      zoom: 15,
      center: [113.2644, 23.1291],
      resizeEnable: true
    })
    mapInstanceRef.current = map

    // 3. 加载Geocoder插件
    window.AMap.plugin(['AMap.Geocoder'], () => {
      const geocoder = new window.AMap.Geocoder({ city: '全国' })
      const fullAddress = address.includes('广州') ? address : `广州市${address}`

      geocoder.getLocation(fullAddress, (status: string, result: any) => {
        console.log('📍 地址解析结果:', { status, result, fullAddress })

        if (
          status === 'complete' &&
          result?.info === 'OK' &&
          result?.geocodes?.length > 0 &&
          result.geocodes[0]?.location
        ) {
          const targetLocation = result.geocodes[0].location
          console.log('✅ 解析成功，目标坐标:', targetLocation)

          // 4. 核心修复：先创建标记，再用 setFitView 强制地图适配（最稳的方式）
          console.log('创建标记...')
          const marker = new window.AMap.Marker({
            position: targetLocation,
            map: map,
            title: name,
            anchor: 'bottom-center'
          })
          console.log('标记创建成功:', marker)

          // 验证标记是否在地图上
          console.log('标记是否在地图上:', marker.getMap() === map)
          console.log('标记位置:', marker.getPosition())

          // 等待一小段时间，确保地图完全就绪
          setTimeout(() => {
            console.log('执行 setFitView...')
            // 关键！用 setFitView 自动调整地图中心和缩放，确保标记在视野正中央
            // 第二个参数是 padding，避免标记贴边
            map.setFitView([marker], false, [60, 60, 60, 60])
            console.log('setFitView 执行完成')
            
            // 验证地图中心
            setTimeout(() => {
              console.log('当前地图中心:', map.getCenter())
              console.log('目标位置:', targetLocation)
            }, 500)
          }, 300)

          // 打开信息窗口
          const infoWindow = new window.AMap.InfoWindow({
            content: `<div style="padding: 10px;"><h3 style="margin:0 0 8px;font-size:16px;">${name}</h3><p style="margin:0;font-size:14px;color:#666;">${address}</p></div>`,
            offset: new window.AMap.Pixel(0, -30)
          })
          infoWindow.open(map, targetLocation)

          setError(null)
        } else {
          const failReason = result?.info || '地址无匹配结果'
          console.error('❌ 地址解析失败:', failReason)
          setError(`无法定位到地址「${fullAddress}」，原因: ${failReason}`)
        }

        setLoading(false)
      })
    })

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, [address, name]) // 仅当address/name变化时重新执行

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{name || '位置'} - 地图</h1>
          <div className="w-8"></div> {/* 占位居中 */}
        </div>

        {/* 地图容器 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[600px] relative"
          />

          {/* 加载中遮罩 */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">正在定位地址...</p>
            </div>
          )}

          {/* 错误提示遮罩 */}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 max-w-md text-center">{error}</p>
            </div>
          )}
        </div>

        {/* 地址信息卡片 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">位置信息</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">名称:</span>
              <span className="ml-2 text-gray-900">{name}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">地址:</span>
              <span className="ml-2 text-gray-900">{address}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">类型:</span>
              <span className="ml-2 text-gray-900">
                {type === 'attraction' ? '景点' : type === 'restaurant' ? '餐厅' : '未知'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
