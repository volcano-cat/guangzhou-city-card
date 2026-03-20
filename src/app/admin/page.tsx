'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'

const AdminPage = () => {
  const { user } = useAuthStore()
  const router = useRouter()

  // 检查用户是否为管理员
  if (!user || user.role !== 'ADMIN') {
    router.push('/')
    return null
  }

  const menuItems = [
    {
      name: '景点管理',
      href: '/admin/attractions',
      icon: '🗺️'
    },
    {
      name: '美食管理',
      href: '/admin/food',
      icon: '🍜'
    },
    {
      name: '角色管理',
      href: '/admin/roles',
      icon: '👥'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">管理中心</h1>
          <p className="mt-2 text-sm text-gray-600">欢迎回来，{user.nickname || user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
              <p className="mt-2 text-sm text-gray-600">{item.name}相关内容</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPage