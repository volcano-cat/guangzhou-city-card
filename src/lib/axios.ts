import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 10000,
})

// 检查 token 是否即将过期（剩余时间少于 5 分钟）
function isTokenExpiringSoon(): boolean {
  const authStore = useAuthStore.getState()
  if (!authStore.user) return false
  
  // 假设 token 有效期为 1 小时，在剩余 5 分钟时触发刷新
  const tokenAge = localStorage.getItem('tokenTimestamp')
  if (!tokenAge) return false
  
  const ageMinutes = (Date.now() - parseInt(tokenAge)) / 60000
  return ageMinutes > 55 // 超过 55 分钟说明即将过期
}

// 主动刷新 token（在即将过期时调用）
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function refreshTokenIfNeeded(): Promise<void> {
  if (!isTokenExpiringSoon() || isRefreshing) return
  
  isRefreshing = true
  try {
    const refreshInstance = axios.create({
      baseURL: '/',
      withCredentials: true,
    })
    
    const refreshResponse = await refreshInstance.post('/api/auth/refresh')
    if (refreshResponse.data.success) {
      const userResponse = await refreshInstance.get('/api/auth/me')
      if (userResponse.data.success) {
        const authStore = useAuthStore.getState()
        const userData = userResponse.data.data
        authStore.setUser(userData)
        localStorage.setItem('tokenTimestamp', Date.now().toString())
      }
    }
  } catch (error) {
    console.error('主动刷新 token 失败:', error)
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

// 请求拦截器 - 在发送请求前检查并刷新 token
api.interceptors.request.use(
  async (config) => {
    // 如果 token 即将过期，先刷新
    if (isTokenExpiringSoon() && !isRefreshing) {
      refreshPromise = refreshTokenIfNeeded()
    }
    // 如果正在刷新，等待刷新完成
    if (refreshPromise) {
      await refreshPromise
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 在收到 401 时刷新 token（兜底）
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 如果是 401 错误且不是刷新 token 的请求
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // 使用新的 axios 实例刷新 token，避免递归调用拦截器
        const refreshInstance = axios.create({
          baseURL: '/',
          withCredentials: true,
        })
        
        const refreshResponse = await refreshInstance.post('/api/auth/refresh')
        
        if (refreshResponse.data.success) {
          // 刷新成功，更新用户信息
          const userResponse = await refreshInstance.get('/api/auth/me')
          if (userResponse.data.success) {
            const authStore = useAuthStore.getState()
            const userData = userResponse.data.data
            authStore.setUser(userData)
            localStorage.setItem('tokenTimestamp', Date.now().toString())
          }
          // 重新发送原始请求（Cookie 已自动更新）
          return api(originalRequest)
        }
      } catch (refreshError) {
        // 刷新失败，清除用户状态并跳转到登录页
        const authStore = useAuthStore.getState()
        authStore.logout()
        localStorage.removeItem('tokenTimestamp')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api