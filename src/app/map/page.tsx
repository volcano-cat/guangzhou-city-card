'use client'

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// 全局类型声明
declare global {
  interface Window {
    AMap: any
  }
}

function MapContent() {
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

  // 路线规划状态
  const [showRoute, setShowRoute] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

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

  // 路线规划函数
  const calculateRoute = () => {
    if (!address || !window.AMap) return

    setRouteLoading(true)
    setRouteError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          const userLocation = [userLng, userLat]

          try {
            // 加载路线规划插件
            await new Promise((resolve, reject) => {
              window.AMap.plugin(['AMap.Driving'], () => {
                resolve(null)
              })
            })

            // 解析目标地址
            const geocoder = new window.AMap.Geocoder({ city: '全国' })
            const fullAddress = address.includes('广州') ? address : `广州市${address}`

            geocoder.getLocation(fullAddress, (status: string, result: any) => {
              if (
                status === 'complete' &&
                result?.info === 'OK' &&
                result?.geocodes?.length > 0 &&
                result.geocodes[0]?.location
              ) {
                const targetLocation = result.geocodes[0].location
                const targetCoords = [targetLocation.getLng(), targetLocation.getLat()]

                // 创建驾车路线规划实例
                const driving = new window.AMap.Driving({
                  map: mapInstanceRef.current,
                  panel: 'route-panel', // 路线结果面板
                  policy: window.AMap.DrivingPolicy.LEAST_TIME // 最快路线
                })

                // 计算路线
                driving.search(
                  userLocation,
                  targetCoords,
                  (status: string, result: any) => {
                    if (status === 'complete') {
                      console.log('路线规划成功:', result)
                      setShowRoute(true)
                      // 调整地图视野以显示整个路线
                      if (result.routes && result.routes.length > 0) {
                        const route = result.routes[0]
                        const path = route.path
                        if (path && path.length > 0) {
                          mapInstanceRef.current.setFitView()
                        }
                      }
                    } else {
                      console.error('路线规划失败:', result)
                      setRouteError('路线规划失败，请检查地址是否正确')
                    }
                    setRouteLoading(false)
                  }
                )
              } else {
                setRouteError('无法解析目标地址')
                setRouteLoading(false)
              }
            })
          } catch (error) {
            console.error('路线规划错误:', error)
            setRouteError('路线规划失败，请稍后重试')
            setRouteLoading(false)
          }
        },
        (error) => {
          console.error('获取位置失败:', error)
          setRouteError('获取位置失败，请检查位置权限设置')
          setRouteLoading(false)
        }
      )
    } else {
      setRouteError('您的浏览器不支持地理定位')
      setRouteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 隐藏高德地图路线面板里的"前往高德地图导航"按钮 */}
      <style>{`
        /* 隐藏高德地图路线面板里的所有导航按钮 */
        #route-panel .amap-driving-route-btn,
        #route-panel .amap-call,
        #route-panel .amap-driving .amap-driving-result .amap-driving-route .amap-driving-route-btn {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `}</style>
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

        {/* 地图和路线规划容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 地图容器 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden relative">
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

          {/* 路线规划面板 */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">位置信息</h2>
              <div className="space-y-1">
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
                <div className="mt-2 space-y-2">
                  <button 
                    onClick={calculateRoute}
                    disabled={routeLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {routeLoading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        规划中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        路线推荐
                      </>
                    )}
                  </button>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(position => {
                          const userLat = position.coords.latitude;
                          const userLng = position.coords.longitude;
                          // 构建高德地图导航URL
                          const url = `https://uri.amap.com/navigation?from=${userLng},${userLat},当前位置&to=${address}&mode=car`;
                          window.open(url, '_blank');
                        }, error => {
                          alert('获取位置失败，请检查位置权限设置');
                        });
                      } else {
                        alert('您的浏览器不支持地理定位');
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors inline-block"
                  >
                    仅有驾车路线，更多路线请前往高德地图导航
                  </a>
                </div>

                {/* 路线规划错误提示 */}
                {routeError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="text-red-500 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="ml-2 text-sm text-red-600">{routeError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 路线结果面板 */}
            <div className="border-t">
              <div id="route-panel" className={`max-h-[400px] overflow-y-auto ${!showRoute && 'hidden'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>}>
      <MapContent />
    </Suspense>
  )
}
