'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import axios from '@/lib/axios'
import { toast } from 'sonner'

const navigation = [
  { name: '首页', href: '/' },
  { name: '新闻', href: '/news' },
  { name: '景点', href: '/attractions' },
  { name: '美食', href: '/food' },
  { name: '文化', href: '/culture' },
  { name: '经济', href: '/economy' },
]

export default function Header() {
  const { user, logout, setUser, isLoading } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // 检查 Cookie 中是否有指定的 token
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // 检查是否有 access token
  const hasAccessToken = () => {
    return getCookie('accessToken') !== null
  }

  // 检查是否有 refresh token
  const hasRefreshToken = () => {
    return getCookie('refreshToken') !== null
  }

  // 页面初始化时检查并刷新 token（只执行一次）
  useEffect(() => {
    let isMounted = true
    let hasRefreshed = false
    
    const initAuth = async () => {
      if (!isMounted || hasRefreshed) return
      hasRefreshed = true
      
      // 等待状态恢复完成
      if (isLoading) {
        setTimeout(initAuth, 100)
        return
      }
      
      // 如果没有 refresh token，说明用户确实没有登录
      if (!hasRefreshToken()) {
        return
      }
      
      // 判断是否需要刷新：
      // 1. 有用户信息但没有 access token（Cookie 中没有）
      // 2. 有 refresh token 但没有 access token
      // 3. 有用户信息但 token 即将过期（超过 55 分钟）
      // 4. 有 refresh token 但没有用户信息（localStorage 被清空了）
      const now = Date.now()
      const tokenTimestamp = localStorage.getItem('tokenTimestamp')
      const tokenExpired = tokenTimestamp && (now - parseInt(tokenTimestamp)) / 60000 > 55
      
      const needsRefresh = (user && !hasAccessToken()) || 
                          (hasRefreshToken() && !hasAccessToken()) ||
                          (user && tokenExpired) ||
                          (hasRefreshToken() && !user)
      
      if (needsRefresh) {
        console.log('🔄 初始化时检测到需要刷新 token:', {
          hasUser: !!user,
          hasAccessToken: hasAccessToken(),
          hasRefreshToken: hasRefreshToken(),
          tokenExpired
        })
        
        try {
          const refreshInstance = axios.create({
            baseURL: '/',
            withCredentials: true,
          })
          
          const refreshResponse = await refreshInstance.post('/api/auth/refresh')
          if (refreshResponse.data.success) {
            console.log('✅ Token 刷新成功')
            const userResponse = await refreshInstance.get('/api/auth/me')
            if (userResponse.data.success) {
              setUser(userResponse.data.data)
              localStorage.setItem('tokenTimestamp', now.toString())
            }
          } else {
            // 刷新失败，清除用户状态
            console.log('❌ Token 刷新失败，清除登录状态')
            logout()
            localStorage.removeItem('tokenTimestamp')
          }
        } catch (error) {
          // 刷新失败（可能 refresh token 也过期了），清除用户状态
          console.error('❌ 初始化时刷新 token 失败:', error)
          logout()
          localStorage.removeItem('tokenTimestamp')
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [isLoading, user, logout, setUser])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-600">广州</span>
              <span className="text-2xl font-bold text-gray-800">城市名片</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img 
                      src={user.avatar || '/moren_avatar/moren_avatar.jpg'} 
                      alt="头像" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{user.nickname || user.email}</span>
                  <svg className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ${userMenuOpen ? 'block' : 'hidden'}`}>
                  <Link
                    href="/user"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      管理中心
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await axios.post('/api/auth/logout');
                        logout();
                        setUserMenuOpen(false);
                        toast.success('登出成功');
                      } catch (error) {
                        console.error('登出错误:', error);
                        // 即使 API 调用失败，也清除本地状态
                        logout();
                        setUserMenuOpen(false);
                        toast.success('登出成功');
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  注册
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
