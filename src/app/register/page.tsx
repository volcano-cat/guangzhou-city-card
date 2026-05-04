'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    setSendingCode(true)
    try {
      const res = await axios.post('/api/auth/send-verification', { email })
      
      if (res.data.success) {
        toast.success('验证码已发送，请查收邮箱')
        // 开始倒计时
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(res.data.error || '发送验证码失败')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || '发送验证码失败，请稍后重试')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !code) {
      toast.error('请输入邮箱、密码和验证码')
      return
    }

    if (password.length < 6) {
      toast.error('密码至少6位')
      return
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', { 
        email, 
        password,
        nickname: nickname || undefined,
        code
      }, { withCredentials: true })
      
      if (res.data.success) {
        setUser(res.data.data.user)
        // 不再需要手动设置 token，因为已经存储在 cookie 中
        router.push('/')
      } else {
        toast.error(res.data.error || '注册失败')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？{' '}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              立即登录
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

            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input"
                  placeholder="请输入验证码"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={sendingCode || countdown > 0}
                  onClick={handleSendCode}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                >
                  {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                昵称 (可选)
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input"
                placeholder="请输入昵称"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="请输入密码（至少6位）"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="请再次输入密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
