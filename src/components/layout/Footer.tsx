import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-red-500">广州</span>城市名片
            </h3>
            <p className="text-gray-400 mb-4">
              探索广州，感受千年商都的魅力。这里有丰富的历史文化、美味的粤式美食、
              现代化的城市风貌，等待您来发现。
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li><Link href="/attractions" className="text-gray-400 hover:text-white">景点推荐</Link></li>
              <li><Link href="/food" className="text-gray-400 hover:text-white">美食探索</Link></li>
              <li><Link href="/culture" className="text-gray-400 hover:text-white">文化历史</Link></li>
              <li><Link href="/economy" className="text-gray-400 hover:text-white">经济发展</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-gray-400">
              <li>地址：广州市天河区</li>
              <li>邮箱：contact@gz-citycard.com</li>
              <li>电话：020-12345678</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 广州城市名片. All rights reserved.</p>
          <p className="mt-2 text-sm">毕业设计作品 - 广州航海学院</p>
        </div>
      </div>
    </footer>
  )
}
