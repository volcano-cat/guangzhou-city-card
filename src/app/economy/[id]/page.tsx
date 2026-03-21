'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as echarts from 'echarts'

// 经济产业详情数据
const industryDetails = [
  {
    id: 1,
    name: '汽车制造',
    icon: '🚗',
    description: '广州是中国重要的汽车生产基地，拥有广汽集团、东风日产、广汽本田等知名车企。',
    details: [
      '广州的汽车制造业起步于20世纪80年代，经过多年发展，已成为中国重要的汽车生产基地之一。',
      '广汽集团是广州汽车产业的龙头企业，旗下拥有广汽本田、广汽丰田、广汽传祺等多个知名品牌。',
      '广州汽车产业集群效应明显，形成了以黄埔、花都、南沙为核心的汽车产业园区。',
      '2023年，广州汽车产量达到300万辆，占全国汽车总产量的10%以上。',
      '广州汽车产业正向电动化、智能化、网联化方向发展，积极布局新能源汽车和智能网联汽车产业。',
      '汽车产业是广州的支柱产业之一，对广州经济增长和就业做出了重要贡献。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20automobile%20manufacturing%20plant%20with%20modern%20production%20line&image_size=landscape_16_9',
    stats: [
      { label: '汽车产量', value: '350万辆', year: '2025年' },
      { label: '产业产值', value: '5800亿元', year: '2025年' },
      { label: '就业人数', value: '22万人', year: '2025年' },
      { label: '企业数量', value: '220家', year: '2025年' }
    ],
    chartData: {
      outputTrend: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [220, 230, 260, 280, 300, 325, 350]
      },
      productionValue: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [3500, 3800, 4200, 4600, 5000, 5400, 5800]
      },
      industryStructure: {
        categories: ['整车制造', '零部件', '销售服务', '汽车金融', '其他'],
        data: [45, 30, 15, 8, 2]
      },
      employmentDistribution: {
        categories: ['生产制造', '研发设计', '销售服务', '管理运营', '其他'],
        data: [60, 15, 15, 8, 2]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [85, 90, 75, 80, 88]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [350, 380, 410, 440, 470],
        growthRate: [7.1, 8.6, 7.9, 7.3, 6.8]
      }
    }
  },
  {
    id: 2,
    name: '电子信息',
    icon: '💻',
    description: '电子信息产业是广州的支柱产业之一，涵盖了通信设备、计算机、软件等领域。',
    details: [
      '广州电子信息产业起步于20世纪90年代，经过快速发展，已成为广州的支柱产业之一。',
      '广州电子信息产业涵盖通信设备、计算机、软件、电子元器件等多个领域，形成了完整的产业链。',
      '广州拥有华为、中兴、腾讯等知名电子信息企业，以及众多中小科技企业。',
      '广州软件产业发展迅速，在游戏、金融科技、智慧城市等领域具有较强竞争力。',
      '广州积极布局新一代信息技术，包括人工智能、大数据、云计算、物联网等领域。',
      '电子信息产业是广州经济增长的重要引擎，对广州产业升级和数字化转型起到了重要作用。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20electronics%20information%20technology%20industry%20with%20modern%20office%20buildings&image_size=landscape_16_9',
    stats: [
      { label: '产业产值', value: '4800亿元', year: '2025年' },
      { label: '企业数量', value: '5500家', year: '2025年' },
      { label: '就业人数', value: '33万人', year: '2025年' },
      { label: '研发投入', value: '360亿元', year: '2025年' }
    ],
    chartData: {
      productionValue: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [2800, 3000, 3300, 3700, 4000, 4400, 4800]
      },
      rDInvestment: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [180, 200, 230, 270, 300, 330, 360]
      },
      industryStructure: {
        categories: ['通信设备', '计算机', '软件', '电子元器件', '其他'],
        data: [30, 25, 20, 15, 10]
      },
      enterpriseScale: {
        categories: ['大型企业', '中型企业', '小型企业', '初创企业'],
        data: [5, 15, 40, 40]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [90, 85, 88, 82, 80]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [4800, 5200, 5650, 6150, 6700],
        growthRate: [9.1, 8.3, 8.7, 8.9, 9.0]
      }
    }
  },
  {
    id: 3,
    name: '生物医药',
    icon: '💊',
    description: '广州生物医药产业发展迅速，拥有多个国家级生物产业基地和创新中心。',
    details: [
      '广州生物医药产业起步于20世纪90年代，经过多年发展，已成为广州的战略性新兴产业之一。',
      '广州拥有多个国家级生物产业基地，包括广州国际生物岛、中新广州知识城等。',
      '广州生物医药产业涵盖生物技术、化学制药、医疗器械、医疗服务等多个领域。',
      '广州拥有中山大学、华南理工大学等高校的科研支持，以及众多生物医药企业。',
      '广州生物医药产业注重创新，在基因工程、干细胞、精准医疗等领域取得了重要成果。',
      '生物医药产业是广州未来发展的重点产业之一，具有广阔的发展前景。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20biomedical%20industry%20research%20laboratory%20with%20modern%20equipment&image_size=landscape_16_9',
    stats: [
      { label: '产业产值', value: '1800亿元', year: '2025年' },
      { label: '企业数量', value: '1200家', year: '2025年' },
      { label: '专利数量', value: '6500件', year: '2025年' },
      { label: '研发投入', value: '180亿元', year: '2025年' }
    ],
    chartData: {
      productionValue: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [800, 950, 1100, 1300, 1500, 1650, 1800]
      },
      patentGrowth: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [2000, 2800, 3500, 4200, 5000, 5750, 6500]
      },
      industryStructure: {
        categories: ['生物技术', '化学制药', '医疗器械', '医疗服务', '其他'],
        data: [35, 25, 20, 15, 5]
      },
      rDInvestment: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [80, 100, 120, 135, 150, 165, 180]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [88, 75, 80, 85, 70]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [1800, 2050, 2350, 2700, 3100],
        growthRate: [8.3, 13.9, 14.6, 14.9, 14.8]
      }
    }
  },
  {
    id: 4,
    name: '金融服务',
    icon: '🏦',
    description: '广州是华南地区金融中心，拥有完善的金融服务体系和众多金融机构。',
    details: [
      '广州是华南地区的金融中心，拥有完善的金融服务体系和众多金融机构。',
      '广州拥有多家银行、证券、保险等金融机构的区域总部，形成了完整的金融产业链。',
      '广州金融城是广州金融产业的核心区域，聚集了众多金融机构和金融科技企业。',
      '广州积极发展金融科技，在移动支付、区块链、智能金融等领域取得了重要进展。',
      '广州金融产业对实体经济的支持作用明显，为企业发展和居民生活提供了全方位的金融服务。',
      '金融服务是广州的支柱产业之一，对广州经济发展和区域金融中心建设起到了重要作用。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20financial%20district%20with%20modern%20skyscrapers&image_size=landscape_16_9',
    stats: [
      { label: '金融机构', value: '550家', year: '2025年' },
      { label: '金融产值', value: '3500亿元', year: '2025年' },
      { label: '就业人数', value: '16.5万人', year: '2025年' },
      { label: '存贷款余额', value: '12万亿元', year: '2025年' }
    ],
    chartData: {
      financialOutput: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [2200, 2400, 2600, 2800, 3000, 3250, 3500]
      },
      depositLoan: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [6, 7, 8, 9, 10, 11, 12]
      },
      industryStructure: {
        categories: ['银行', '证券', '保险', '金融科技', '其他'],
        data: [40, 20, 15, 15, 10]
      },
      employmentDistribution: {
        categories: ['金融专业', '信息技术', '管理运营', '客户服务', '其他'],
        data: [35, 25, 20, 15, 5]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [80, 90, 85, 88, 85]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [3500, 3780, 4080, 4400, 4750],
        growthRate: [7.7, 8.0, 7.9, 7.8, 7.5]
      }
    }
  },
  {
    id: 5,
    name: '现代商贸',
    icon: '🏪',
    description: '广州是千年商都，拥有众多专业市场和商业中心，商贸流通业发达。',
    details: [
      '广州是千年商都，拥有2000多年的商贸历史，是中国重要的商贸中心之一。',
      '广州拥有众多专业市场，如白马服装市场、黄沙水产市场等，形成了完整的商贸体系。',
      '广州商业中心众多，包括北京路、天河路、上下九等知名商圈，商业氛围浓厚。',
      '广州是中国重要的进出口贸易中心，拥有广州港等重要港口，对外贸易发达。',
      '广州现代商贸业正向数字化、智能化方向发展，积极布局电子商务和跨境电商。',
      '现代商贸是广州的传统优势产业，对广州经济发展和就业起到了重要作用。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20modern%20commercial%20district%20with%20busy%20shopping%20streets&image_size=landscape_16_9',
    stats: [
      { label: '社会消费品零售总额', value: '1.25万亿元', year: '2025年' },
      { label: '进出口总额', value: '1.2万亿元', year: '2025年' },
      { label: '商业企业', value: '11万家', year: '2025年' },
      { label: '就业人数', value: '42万人', year: '2025年' }
    ],
    chartData: {
      retailSales: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [0.85, 0.92, 0.98, 1.03, 1.08, 1.15, 1.25]
      },
      importExport: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [0.75, 0.82, 0.9, 0.98, 1.04, 1.12, 1.2]
      },
      industryStructure: {
        categories: ['批发零售', '进出口贸易', '电子商务', '物流配送', '其他'],
        data: [40, 25, 20, 10, 5]
      },
      enterpriseScale: {
        categories: ['大型企业', '中型企业', '小型企业', '个体工商户'],
        data: [1, 4, 15, 80]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [75, 88, 80, 85, 90]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [1.25, 1.34, 1.44, 1.55, 1.67],
        growthRate: [6.9, 7.2, 7.5, 7.6, 7.7]
      }
    }
  },
  {
    id: 6,
    name: '人工智能',
    icon: '🤖',
    description: '广州积极发展人工智能产业，在智能制造、智慧城市等领域取得显著成果。',
    details: [
      '广州人工智能产业起步于21世纪初，经过快速发展，已成为广州的战略性新兴产业之一。',
      '广州拥有多个人工智能产业园区，如广州人工智能与数字经济试验区等。',
      '广州人工智能产业涵盖智能制造、智慧城市、智能医疗、智能交通等多个领域。',
      '广州拥有中山大学、华南理工大学等高校的科研支持，以及众多人工智能企业。',
      '广州人工智能产业注重应用场景落地，在智能制造、智慧城市等领域取得了显著成果。',
      '人工智能是广州未来发展的重点产业之一，对广州产业升级和数字化转型起到了重要作用。'
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20artificial%20intelligence%20industry%20with%20modern%20technology%20center&image_size=landscape_16_9',
    stats: [
      { label: '产业产值', value: '1500亿元', year: '2025年' },
      { label: '企业数量', value: '1300家', year: '2025年' },
      { label: '专利数量', value: '4500件', year: '2025年' },
      { label: '研发投入', value: '280亿元', year: '2025年' }
    ],
    chartData: {
      productionValue: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [300, 450, 600, 800, 1000, 1250, 1500]
      },
      patentGrowth: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [800, 1200, 1800, 2400, 3000, 3750, 4500]
      },
      industryStructure: {
        categories: ['智能硬件', '软件服务', '数据服务', '应用集成', '其他'],
        data: [25, 30, 20, 15, 10]
      },
      applicationDistribution: {
        categories: ['智能制造', '智慧城市', '智能医疗', '智能交通', '其他'],
        data: [30, 25, 20, 15, 10]
      },
      rDInvestment: {
        years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        data: [80, 120, 150, 180, 200, 240, 280]
      },
      competitiveness: {
        categories: ['技术创新', '产业规模', '人才优势', '政策支持', '市场份额'],
        data: [95, 70, 85, 90, 65]
      },
      forecast: {
        years: ['2025', '2026', '2027', '2028', '2029'],
        data: [1500, 1800, 2160, 2592, 3110],
        growthRate: [20, 20, 19, 19, 20]
      }
    }
  }
]

export default function IndustryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [industry, setIndustry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 图表容器引用
  const chartRefs = {
    trendChart: useRef<HTMLDivElement>(null),
    structureChart: useRef<HTMLDivElement>(null),
    distributionChart: useRef<HTMLDivElement>(null),
    otherChart: useRef<HTMLDivElement>(null),
    competitivenessChart: useRef<HTMLDivElement>(null),
    forecastChart: useRef<HTMLDivElement>(null)
  }

  useEffect(() => {
    const id = parseInt(params.id as string)
    if (id && id > 0 && id <= industryDetails.length) {
      const selectedIndustry = industryDetails.find(item => item.id === id)
      setIndustry(selectedIndustry)
    }
    setLoading(false)
  }, [params.id])

  // 渲染图表
  useEffect(() => {
    if (!industry || !industry.chartData) return

    // 保存清理函数
    const cleanups: (() => void)[] = []

    // 渲染趋势图
    if (chartRefs.trendChart.current) {
      const trendChart = echarts.init(chartRefs.trendChart.current)
      let trendOption: echarts.EChartsOption

      if (industry.id === 1) {
        // 汽车制造 - 产量趋势
        trendOption = {
          title: {
            text: '汽车产量趋势（万辆）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.outputTrend.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.outputTrend.data,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#ff4d4f'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
              ])
            }
          }]
        }
      } else if (industry.id === 5) {
        // 现代商贸 - 社会消费品零售总额
        trendOption = {
          title: {
            text: '社会消费品零售总额（万亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.retailSales.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.retailSales.data,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#1890ff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ])
            }
          }]
        }
      } else if (industry.id === 4) {
        // 金融服务 - 存贷款余额
        trendOption = {
          title: {
            text: '存贷款余额（万亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.depositLoan.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.depositLoan.data,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#52c41a'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
              ])
            }
          }]
        }
      } else {
        // 其他产业 - 产值趋势
        trendOption = {
          title: {
            text: '产业产值趋势（亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.productionValue.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.productionValue.data,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#722ed1'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
                { offset: 1, color: 'rgba(114, 46, 209, 0.1)' }
              ])
            }
          }]
        }
      }

      trendChart.setOption(trendOption)

      // 响应式
      const handleResize = () => {
        trendChart.resize()
      }
      window.addEventListener('resize', handleResize)

      cleanups.push(() => {
        trendChart.dispose()
        window.removeEventListener('resize', handleResize)
      })
    }

    // 渲染产业结构图
    if (chartRefs.structureChart.current && industry.chartData.industryStructure) {
      const structureChart = echarts.init(chartRefs.structureChart.current)
      const structureOption: echarts.EChartsOption = {
        title: {
          text: '产业结构分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}% ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '产业结构',
            type: 'pie',
            radius: '60%',
            data: industry.chartData.industryStructure.categories.map((category: string, index: number) => ({
              value: industry.chartData.industryStructure.data[index],
              name: category
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      structureChart.setOption(structureOption)

      // 响应式
      const handleResize = () => {
        structureChart.resize()
      }
      window.addEventListener('resize', handleResize)

      cleanups.push(() => {
        structureChart.dispose()
        window.removeEventListener('resize', handleResize)
      })
    }

    // 渲染就业分布图
    if (chartRefs.distributionChart.current) {
      const distributionChart = echarts.init(chartRefs.distributionChart.current)
      let distributionOption: echarts.EChartsOption | null = null

      if ((industry.id === 1 || industry.id === 4) && industry.chartData.employmentDistribution) {
        // 汽车制造和金融服务 - 就业分布
        distributionOption = {
          title: {
            text: '就业分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.employmentDistribution.categories,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {
            type: 'value',
            name: '占比 (%)'
          },
          series: [{
            data: industry.chartData.employmentDistribution.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff7875' },
                { offset: 1, color: '#ff4d4f' }
              ])
            }
          }]
        }
      } else if ((industry.id === 2 || industry.id === 5) && industry.chartData.enterpriseScale) {
        // 电子信息和现代商贸 - 企业规模分布
        distributionOption = {
          title: {
            text: '企业规模分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.enterpriseScale.categories,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {
            type: 'value',
            name: '占比 (%)'
          },
          series: [{
            data: industry.chartData.enterpriseScale.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#91d5ff' },
                { offset: 1, color: '#1890ff' }
              ])
            }
          }]
        }
      } else if (industry.id === 6 && industry.chartData.applicationDistribution) {
        // 人工智能 - 应用分布
        distributionOption = {
          title: {
            text: '应用领域分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.applicationDistribution.categories,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {
            type: 'value',
            name: '占比 (%)'
          },
          series: [{
            data: industry.chartData.applicationDistribution.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#b37feb' },
                { offset: 1, color: '#722ed1' }
              ])
            }
          }]
        }
      } else if (industry.chartData.patentGrowth) {
        // 生物医药 - 专利增长
        distributionOption = {
          title: {
            text: '专利数量增长',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.patentGrowth.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.patentGrowth.data,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#52c41a'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
              ])
            }
          }]
        }
      }

      if (distributionOption) {
        distributionChart.setOption(distributionOption)

        // 响应式
        const handleResize = () => {
          distributionChart.resize()
        }
        window.addEventListener('resize', handleResize)

        cleanups.push(() => {
          distributionChart.dispose()
          window.removeEventListener('resize', handleResize)
        })
      }
    }

    // 渲染研发投入图
    if (chartRefs.otherChart.current) {
      const otherChart = echarts.init(chartRefs.otherChart.current)
      let otherOption: echarts.EChartsOption | null = null

      if ((industry.id === 3 || industry.id === 6) && industry.chartData.rDInvestment) {
        // 生物医药和人工智能 - 研发投入
        otherOption = {
          title: {
            text: '研发投入趋势（亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.rDInvestment.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.rDInvestment.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#389e0d' }
              ])
            }
          }]
        }
      } else if (industry.id === 5 && industry.chartData.importExport) {
        // 现代商贸 - 进出口总额
        otherOption = {
          title: {
            text: '进出口总额（万亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.importExport.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.importExport.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#faad14' },
                { offset: 1, color: '#d48806' }
              ])
            }
          }]
        }
      } else if (industry.id === 4 && industry.chartData.financialOutput) {
        // 金融服务 - 金融产值
        otherOption = {
          title: {
            text: '金融产值趋势（亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.financialOutput.years
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.financialOutput.data,
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#13c2c2' },
                { offset: 1, color: '#08979c' }
              ])
            }
          }]
        }
      } else {
        // 其他产业 - 研发投入
        otherOption = {
          title: {
            text: '研发投入趋势（亿元）',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.rDInvestment?.years || ['2019', '2020', '2021', '2022', '2023']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: industry.chartData.rDInvestment?.data || [100, 120, 150, 180, 200],
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#fa8c16' },
                { offset: 1, color: '#d46b08' }
              ])
            }
          }]
        }
      }

      if (otherOption) {
        otherChart.setOption(otherOption)

        // 响应式
        const handleResize = () => {
          otherChart.resize()
        }
        window.addEventListener('resize', handleResize)

        cleanups.push(() => {
          otherChart.dispose()
          window.removeEventListener('resize', handleResize)
        })
      }
    }

    // 渲染竞争力分析图表
    if (chartRefs.competitivenessChart.current && industry.chartData.competitiveness) {
      const competitivenessChart = echarts.init(chartRefs.competitivenessChart.current)
      const competitivenessOption: echarts.EChartsOption = {
        title: {
          text: '产业竞争力分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        radar: {
          indicator: industry.chartData.competitiveness.categories.map((category: string, index: number) => ({
            name: category,
            max: 100
          }))
        },
        series: [{
          name: '竞争力指标',
          type: 'radar',
          data: [{
            value: industry.chartData.competitiveness.data,
            name: industry.name,
            areaStyle: {
              color: 'rgba(114, 46, 209, 0.2)'
            },
            lineStyle: {
              color: '#722ed1'
            },
            itemStyle: {
              color: '#722ed1'
            }
          }]
        }]
      }

      competitivenessChart.setOption(competitivenessOption)

      // 响应式
      const handleResize = () => {
        competitivenessChart.resize()
      }
      window.addEventListener('resize', handleResize)

      cleanups.push(() => {
        competitivenessChart.dispose()
        window.removeEventListener('resize', handleResize)
      })
    }

    // 渲染产业发展预测图表
    if (chartRefs.forecastChart.current && industry.chartData.forecast) {
      const forecastChart = echarts.init(chartRefs.forecastChart.current)
      let forecastOption: echarts.EChartsOption

      if (industry.id === 5) {
        // 现代商贸 - 社会消费品零售总额预测
        forecastOption = {
          title: {
            text: '社会消费品零售总额预测（万亿元）',
            left: 'center',
            top: '10px'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['零售总额', '增长率'],
            top: 30
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.forecast.years
          },
          yAxis: [
            {
              type: 'value',
              name: '零售总额（万亿元）',
              position: 'left'
            },
            {
              type: 'value',
              name: '增长率（%）',
              position: 'right',
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: [
            {
              name: '零售总额',
              type: 'line',
              data: industry.chartData.forecast.data,
              smooth: true,
              lineStyle: {
                color: '#1890ff'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                  { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
                ])
              }
            },
            {
              name: '增长率',
              type: 'line',
              yAxisIndex: 1,
              data: industry.chartData.forecast.growthRate,
              smooth: true,
              lineStyle: {
                color: '#52c41a'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                  { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
                ])
              }
            }
          ]
        }
      } else {
        // 其他产业 - 产值或产量预测
        const isAutoIndustry = industry.id === 1
        const title = isAutoIndustry ? '汽车产量预测（万辆）' : '产业产值预测（亿元）'
        
        forecastOption = {
          title: {
            text: title,
            left: 'center',
            top: '10px'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: [isAutoIndustry ? '汽车产量' : '产业产值', '增长率'],
            top: 30
          },
          xAxis: {
            type: 'category',
            data: industry.chartData.forecast.years
          },
          yAxis: [
            {
              type: 'value',
              name: isAutoIndustry ? '产量（万辆）' : '产值（亿元）',
              position: 'left'
            },
            {
              type: 'value',
              name: '增长率（%）',
              position: 'right',
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: [
            {
              name: isAutoIndustry ? '汽车产量' : '产业产值',
              type: 'line',
              data: industry.chartData.forecast.data,
              smooth: true,
              lineStyle: {
                color: '#722ed1'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
                  { offset: 1, color: 'rgba(114, 46, 209, 0.1)' }
                ])
              }
            },
            {
              name: '增长率',
              type: 'line',
              yAxisIndex: 1,
              data: industry.chartData.forecast.growthRate,
              smooth: true,
              lineStyle: {
                color: '#fa8c16'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(250, 140, 22, 0.3)' },
                  { offset: 1, color: 'rgba(250, 140, 22, 0.1)' }
                ])
              }
            }
          ]
        }
      }

      forecastChart.setOption(forecastOption)

      // 响应式
      const handleResize = () => {
        forecastChart.resize()
      }
      window.addEventListener('resize', handleResize)

      cleanups.push(() => {
        forecastChart.dispose()
        window.removeEventListener('resize', handleResize)
      })
    }

    // 返回综合清理函数
    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [industry])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!industry) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">产业内容不存在</h1>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回产业列表
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
          返回产业列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-64 md:h-80 bg-gray-200">
          <img
            src={industry.image}
            alt={industry.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="text-4xl mr-4">{industry.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900">{industry.name}</h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">{industry.description}</p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">产业详情</h2>
            <ul className="space-y-3">
              {industry.details.map((detail: string, index: number) => (
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">产业数据</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {industry.stats.map((stat: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.year}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">产业数据分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 h-80">
            <div ref={chartRefs.trendChart} className="w-full h-full"></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 h-80">
            <div ref={chartRefs.structureChart} className="w-full h-full"></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 h-80">
            <div ref={chartRefs.distributionChart} className="w-full h-full"></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 h-80">
            <div ref={chartRefs.otherChart} className="w-full h-full"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">产业竞争力分析</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 h-96">
            <div ref={chartRefs.competitivenessChart} className="w-full h-full"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">产业发展预测</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 h-96">
            <div ref={chartRefs.forecastChart} className="w-full h-full"></div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">相关产业</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {industryDetails
            .filter(item => item.id !== industry.id)
            .slice(0, 5)
            .map((item) => (
              <a
                key={item.id}
                href={`/economy/${item.id}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}