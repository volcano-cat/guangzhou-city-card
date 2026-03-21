'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// 文化详情数据
const cultureDetails = [
  {
    id: 1,
    title: '岭南文化',
    icon: '🏛️',
    description: '岭南文化是中华文化的重要组成部分，以广州为中心，融合了中原文化、海洋文化和本土文化，形成了独特的文化体系。',
    details: [
      '岭南文化的形成与发展经历了漫长的历史过程，从秦汉时期开始，中原文化与岭南本土文化相互融合，逐渐形成了独具特色的岭南文化体系。',
      '岭南文化具有开放性、兼容性和创新性的特点，由于地理位置的优势，它吸收了来自中原、海外的文化元素，形成了多元包容的文化特质。',
      '岭南文化在语言、饮食、建筑、艺术等方面都有独特的表现形式，如粤语、粤菜、骑楼建筑、粤剧等。',
      '岭南文化注重实用主义，强调实际效果和生活品质，体现了岭南人民务实、开放的生活态度。',
      '作为岭南文化的中心，广州在文化传承和发展方面发挥着重要作用，是岭南文化的重要代表城市。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lingnan%20culture%20traditional%20architecture%20in%20Guangzhou%2C%20China&image_size=landscape_16_9'
  },
  {
    id: 2,
    title: '粤剧艺术',
    icon: '🎭',
    description: '粤剧是广东省最大的地方戏曲剧种，被列入世界非物质文化遗产名录，以其独特的唱腔和表演形式著称。',
    details: [
      '粤剧起源于明代，发展于清代，是岭南地区最具代表性的戏曲剧种之一，也是中国南方影响最大的戏曲剧种。',
      '粤剧的唱腔丰富多样，包括梆子、二黄、西皮等多种声腔，音乐伴奏以高胡、扬琴、锣鼓等乐器为主。',
      '粤剧的表演程式规范，动作优美，讲究唱、做、念、打四种艺术手段的结合，具有很高的艺术价值。',
      '粤剧的剧目丰富，既有传统经典剧目，如《帝女花》、《紫钗记》等，也有现代题材的新剧目。',
      '2009年，粤剧被联合国教科文组织列入人类非物质文化遗产代表作名录，成为世界级的文化遗产。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20opera%20performance%20with%20traditional%20costumes%20and%20makeup&image_size=landscape_16_9'
  },
  {
    id: 3,
    title: '醒狮文化',
    icon: '🦁',
    description: '醒狮是广东传统民俗文化的代表，每逢节庆都会有醒狮表演，象征着吉祥如意、驱邪避害。',
    details: [
      '醒狮起源于唐代，发展于明清时期，是岭南地区最具特色的民间传统体育活动之一。',
      '醒狮表演通常由两人合作完成，一人舞狮头，一人舞狮尾，通过各种高难度动作展现狮子的威猛和灵动。',
      '醒狮表演有一套完整的程式，包括起势、常态、奋起、疑进、抓痒、迎宾、施礼、惊跃、审视、酣睡、出洞、发威、过山、上楼台等动作。',
      '醒狮表演中，狮子的颜色通常有黄色、红色、黑色等，不同颜色的狮子有不同的象征意义，如黄色代表刘备，红色代表关羽，黑色代表张飞。',
      '醒狮文化不仅在广州广泛流传，也随着华人的迁徙传播到世界各地，成为海外华人社区重要的文化活动。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20lion%20dance%20performance%20with%20traditional%20costumes%20in%20Guangzhou&image_size=landscape_16_9'
  },
  {
    id: 4,
    title: '龙舟竞渡',
    icon: '🚣',
    description: '端午节龙舟竞渡是广州重要的传统习俗，珠江两岸每年都会举办盛大的龙舟赛事。',
    details: [
      '龙舟竞渡起源于战国时期，是为了纪念爱国诗人屈原而举行的传统活动，至今已有2000多年的历史。',
      '广州的龙舟竞渡通常在端午节期间举行，珠江水面上百舸争流，场面十分壮观。',
      '龙舟的制作工艺精湛，通常由优质木材制成，龙首和龙尾装饰精美，象征着吉祥和力量。',
      '龙舟比赛时，队员们随着鼓点的节奏划桨，齐心协力向终点冲刺，展现了团队合作的精神。',
      '除了比赛，龙舟竞渡还包括起龙、祭龙、游龙等传统仪式，体现了深厚的文化内涵。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon%20boat%20race%20on%20Pearl%20River%20in%20Guangzhou%20during%20Dragon%20Boat%20Festival&image_size=landscape_16_9'
  },
  {
    id: 5,
    title: '广府建筑',
    icon: '🏘️',
    description: '广府建筑以骑楼、西关大屋、镬耳墙等为代表，体现了岭南建筑的独特风格和中西合璧的特点。',
    details: [
      '骑楼是广州最具特色的建筑形式之一，起源于19世纪末20世纪初，是中西建筑文化融合的产物。',
      '骑楼的特点是一楼为商铺，二楼以上向外延伸，形成走廊，既可以遮阳避雨，又方便行人购物。',
      '西关大屋是广州传统民居的代表，通常由多进院落组成，布局严谨，装饰精美，体现了广府人家的生活品味。',
      '镬耳墙是广府建筑的标志性元素，因其形状像铁锅的耳朵而得名，具有防火、通风等功能，也是富贵的象征。',
      '广府建筑注重与自然环境的和谐统一，讲究通风、采光，适应岭南地区炎热潮湿的气候特点。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Cantonese%20architecture%20with%20 qilou%20buildings%20in%20Guangzhou&image_size=landscape_16_9'
  },
  {
    id: 6,
    title: '茶文化',
    icon: '🍵',
    description: '广州早茶文化源远流长，"一盅两件"是广州人独特的生活方式，体现了悠闲的生活态度。',
    details: [
      '广州的茶文化可以追溯到唐代，经过宋元明清的发展，形成了独特的早茶文化。',
      '"一盅两件"是广州早茶的核心，指的是一壶茶配两件点心，体现了广州人慢节奏的生活方式。',
      '广州的茶点种类繁多，包括虾饺、烧卖、凤爪、肠粉等，制作精美，口味丰富。',
      '早茶不仅是一种饮食方式，也是广州人社交、交流的重要场合，体现了广州人注重生活品质的特点。',
      '广州的茶楼文化兴盛，从传统的老字号到现代的茶餐厅，都体现了茶文化在广州的深厚底蕴。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20morning%20tea%20with%20traditional%20dim%20sum%20in%20Guangzhou&image_size=landscape_16_9'
  }
]

export default function CultureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [culture, setCulture] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = parseInt(params.id as string)
    if (id && id > 0 && id <= cultureDetails.length) {
      const selectedCulture = cultureDetails.find(item => item.id === id)
      setCulture(selectedCulture)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!culture) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">文化内容不存在</h1>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回文化列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-64 md:h-80 bg-gray-200">
          <img
            src={culture.image}
            alt={culture.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="text-4xl mr-4">{culture.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900">{culture.title}</h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">{culture.description}</p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">详细介绍</h2>
            <ul className="space-y-3">
              {culture.details.map((detail: string, index: number) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">相关文化</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cultureDetails
            .filter(item => item.id !== culture.id)
            .slice(0, 5)
            .map((item) => (
              <a
                key={item.id}
                href={`/culture/${item.id}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}