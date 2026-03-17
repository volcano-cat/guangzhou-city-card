import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            花城广州
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            千年商都，南国明珠。探索这座融合传统与现代的魅力之城
          </p>
          <Link
            href="/attractions"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            开始探索
          </Link>
        </div>
      </section>

      {/* 城市简介 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              关于广州
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              广州，简称"穗"，别称羊城、花城，是广东省省会、副省级市、国家中心城市、超大城市。
              作为中国通往世界的南大门，广州拥有2200多年的建城历史，是岭南文化的发源地。
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-4xl font-bold text-red-600 mb-2">2200+</div>
              <div className="text-gray-600">建城历史（年）</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-4xl font-bold text-red-600 mb-2">1800+</div>
              <div className="text-gray-600">常住人口（万）</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-4xl font-bold text-red-600 mb-2">7434</div>
              <div className="text-gray-600">面积（km²）</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-4xl font-bold text-red-600 mb-2">11</div>
              <div className="text-gray-600">行政区</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色板块 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            探索广州
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/attractions" className="group">
              <div className="card p-6 text-center h-full">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600">景点推荐</h3>
                <p className="text-gray-600">广州塔、陈家祠、沙面、白云山等著名景点</p>
              </div>
            </Link>
            
            <Link href="/food" className="group">
              <div className="card p-6 text-center h-full">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600">美食探索</h3>
                <p className="text-gray-600">粤菜、早茶、肠粉、叉烧等地道美食</p>
              </div>
            </Link>
            
            <Link href="/culture" className="group">
              <div className="card p-6 text-center h-full">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">文化历史</h3>
                <p className="text-gray-600">岭南文化、粤剧、醒狮、龙舟等传统文化</p>
              </div>
            </Link>
            
            <Link href="/economy" className="group">
              <div className="card p-6 text-center h-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600">经济发展</h3>
                <p className="text-gray-600">千年商都的现代经济发展与商业活力</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 广州印象 */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            广州印象
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌸</div>
              <h3 className="text-xl font-semibold mb-2">花城</h3>
              <p className="text-gray-400">四季如春，繁花似锦，素有花城美誉</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🏮</div>
              <h3 className="text-xl font-semibold mb-2">羊城</h3>
              <p className="text-gray-400">五羊衔谷的传说，承载千年历史</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🍜</div>
              <h3 className="text-xl font-semibold mb-2">美食之都</h3>
              <p className="text-gray-400">食在广州，粤菜文化源远流长</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
