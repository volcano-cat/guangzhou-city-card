import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '广州城市名片 - 探索千年商都的魅力',
  description: '广州线上城市名片系统，展示广州的历史文化、旅游景点、美食特色、经济发展等城市风貌。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN'>
      <head>
        {/* 高德地图安全密钥 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window._AMapSecurityConfig = {
              securityJsCode: 'f27a0b47198762af4788469d48493159',
            }
          `,
        }} />
        {/* 高德地图API */}
        <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=66ddaebc786f46784ac236faa833664a"></script>
      </head>
      <body className={inter.className}>
        <div className='min-h-screen flex flex-col'>
          <Header />
          <main className='flex-grow'>
            {children}
          </main>
          <Footer />
        </div>
        {/* 全局AI聊天悬浮按钮 */}
        <a 
          href="/chat"
          className="fixed left-4 top-20 z-50 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-500 hover:border-red-600"
          title="AI智能助手"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </a>
      </body>
    </html>
  )
}