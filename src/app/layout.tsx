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
      <body className={inter.className}>
        <div className='min-h-screen flex flex-col'>
          <Header />
          <main className='flex-grow'>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}