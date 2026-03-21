export default function CulturePage() {
  const cultures = [
    {
      title: '岭南文化',
      description: '岭南文化是中华文化的重要组成部分，以广州为中心，融合了中原文化、海洋文化和本土文化，形成了独特的文化体系。',
      icon: '🏛️'
    },
    {
      title: '粤剧艺术',
      description: '粤剧是广东省最大的地方戏曲剧种，被列入世界非物质文化遗产名录，以其独特的唱腔和表演形式著称。',
      icon: '🎭'
    },
    {
      title: '醒狮文化',
      description: '醒狮是广东传统民俗文化的代表，每逢节庆都会有醒狮表演，象征着吉祥如意、驱邪避害。',
      icon: '🦁'
    },
    {
      title: '龙舟竞渡',
      description: '端午节龙舟竞渡是广州重要的传统习俗，珠江两岸每年都会举办盛大的龙舟赛事。',
      icon: '🚣'
    },
    {
      title: '广府建筑',
      description: '广府建筑以骑楼、西关大屋、镬耳墙等为代表，体现了岭南建筑的独特风格和中西合璧的特点。',
      icon: '🏘️'
    },
    {
      title: '茶文化',
      description: '广州早茶文化源远流长，"一盅两件"是广州人独特的生活方式，体现了悠闲的生活态度。',
      icon: '🍵'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">广州文化</h1>
        <p className="text-gray-600 mt-2">
          探索岭南文化的深厚底蕴
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cultures.map((culture, index) => (
          <a 
            key={index} 
            href={`/culture/${index + 1}`}
            className="card p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-5xl mb-4">{culture.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{culture.title}</h3>
            <p className="text-gray-600">{culture.description}</p>
          </a>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">广州历史</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            广州有着2200多年的建城历史，是中国历史文化名城之一。从秦朝设立南海郡开始，
            广州就一直是岭南地区的政治、经济、文化中心。
          </p>
          <p className="mt-4">
            作为海上丝绸之路的起点，广州自古就是中国对外贸易的重要港口。
            唐宋时期，广州已是世界著名的贸易大港，来自世界各地的商人云集于此。
          </p>
          <p className="mt-4">
            近代以来，广州更是中国革命的策源地，孙中山先生在此创建了中国同盟会，
            发动了多次起义，为推翻封建帝制、建立民主共和作出了重要贡献。
          </p>
        </div>
      </div>
    </div>
  )
}
