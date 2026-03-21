'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { setUser, setToken, setLoading } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLocalLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('请输入邮箱和密码')
      return
    }

    setLocalLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      
      if (res.data.success) {
        setUser(res.data.data.user)
        setToken(res.data.data.token)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.data.token
        router.push(redirect)
      } else {
        toast.error(res.data.error || '登录失败')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || '登录失败，请稍后重试')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            还没有账户？{' '}
            <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
              立即注册
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="请输入邮箱"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
