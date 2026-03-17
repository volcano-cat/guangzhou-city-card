export default function EconomyPage() {
  const stats = [
    { label: 'GDP总量', value: '2.88万亿', unit: '元', year: '2023年' },
    { label: '常住人口', value: '1882.7', unit: '万人', year: '2023年' },
    { label: '进出口总额', value: '1.04万亿', unit: '元', year: '2023年' },
    { label: '社会消费品零售总额', value: '1.08万亿', unit: '元', year: '2023年' },
  ]

  const industries = [
    {
      name: '汽车制造',
      description: '广州是中国重要的汽车生产基地，拥有广汽集团、东风日产、广汽本田等知名车企。',
      icon: '🚗'
    },
    {
      name: '电子信息',
      description: '电子信息产业是广州的支柱产业之一，涵盖了通信设备、计算机、软件等领域。',
      icon: '💻'
    },
    {
      name: '生物医药',
      description: '广州生物医药产业发展迅速，拥有多个国家级生物产业基地和创新中心。',
      icon: '💊'
    },
    {
      name: '金融服务',
      description: '广州是华南地区金融中心，拥有完善的金融服务体系和众多金融机构。',
      icon: '🏦'
    },
    {
      name: '现代商贸',
      description: '广州是千年商都，拥有众多专业市场和商业中心，商贸流通业发达。',
      icon: '🏪'
    },
    {
      name: '人工智能',
      description: '广州积极发展人工智能产业，在智能制造、智慧城市等领域取得显著成果。',
      icon: '🤖'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">经济发展</h1>
        <p className="text-gray-600 mt-2">
          千年商都的现代经济活力
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.unit}</div>
            <div className="text-gray-900 font-medium mt-2">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.year}</div>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">支柱产业</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <div key={index} className="card p-6">
              <div className="text-4xl mb-4">{industry.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{industry.name}</h3>
              <p className="text-gray-600">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">粤港澳大湾区核心城市</h2>
        <p className="text-red-100 mb-4">
          广州作为粤港澳大湾区的核心城市之一，正积极参与大湾区建设，
          与香港、澳门、深圳等城市协同发展，共同打造世界级城市群。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">11</div>
            <div className="text-sm text-red-200">行政区</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">7434</div>
            <div className="text-sm text-red-200">面积(km²)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">16</div>
            <div className="text-sm text-red-200">地铁线路</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">200+</div>
            <div className="text-sm text-red-200">世界500强企业</div>
          </div>
        </div>
      </div>
    </div>
  )
}
