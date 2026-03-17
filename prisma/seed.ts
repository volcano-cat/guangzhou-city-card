import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      nickname: '管理员',
      role: 'ADMIN',
    },
  })

  // 创建景点分类
  const attractionCategories = [
    { name: '历史古迹', type: 'ATTRACTION' as const, sort: 1 },
    { name: '自然风光', type: 'ATTRACTION' as const, sort: 2 },
    { name: '现代地标', type: 'ATTRACTION' as const, sort: 3 },
    { name: '文化场馆', type: 'ATTRACTION' as const, sort: 4 },
    { name: '休闲公园', type: 'ATTRACTION' as const, sort: 5 },
  ]

  for (const cat of attractionCategories) {
    await prisma.category.upsert({
      where: { id: cat.sort },
      update: cat,
      create: cat,
    })
  }

  // 创建美食分类
  const foodCategories = [
    { name: '粤菜', type: 'FOOD' as const, sort: 10 },
    { name: '早茶点心', type: 'FOOD' as const, sort: 11 },
    { name: '特色小吃', type: 'FOOD' as const, sort: 12 },
    { name: '甜品糖水', type: 'FOOD' as const, sort: 13 },
  ]

  for (const cat of foodCategories) {
    await prisma.category.upsert({
      where: { id: cat.sort },
      update: cat,
      create: cat,
    })
  }

  // 创建景点数据
  const attractions = [
    {
      name: '广州塔',
      description: '广州塔，昵称小蛮腰，是广州市的地标性建筑，塔高600米，是中国第一高塔。广州塔集观光、餐饮、娱乐于一体，拥有世界最高的户外观景平台和摩天轮。',
      address: '广州市海珠区阅江西路222号',
      openTime: '09:30-22:30',
      ticketInfo: '成人票150元起',
      categoryId: 3,
    },
    {
      name: '陈家祠',
      description: '陈家祠，又名陈氏书院，是广东现存规模最大、保存最完整、装饰最精美的传统岭南祠堂式建筑，被誉为"岭南建筑艺术明珠"。',
      address: '广州市荔湾区中山七路恩龙里34号',
      openTime: '08:30-17:30',
      ticketInfo: '成人票10元',
      categoryId: 1,
    },
    {
      name: '白云山',
      description: '白云山是广州著名的风景名胜区，自古就有"羊城第一秀"之称。山上空气清新，植被茂密，是广州市民休闲健身的好去处。',
      address: '广州市白云区广园中路白云山景区',
      openTime: '06:00-22:00',
      ticketInfo: '门票5元，索道另收费',
      categoryId: 2,
    },
    {
      name: '沙面岛',
      description: '沙面岛是广州著名的历史文化街区，岛上保存了大量欧式建筑，是广州近代史的重要见证，现为国家5A级旅游景区。',
      address: '广州市荔湾区沙面大街',
      openTime: '全天开放',
      ticketInfo: '免费',
      categoryId: 1,
    },
    {
      name: '广东省博物馆',
      description: '广东省博物馆是广东省唯一的省级综合博物馆，馆藏丰富，展示了广东的历史文化和自然资源。新馆建筑造型独特，被称为"月光宝盒"。',
      address: '广州市天河区珠江东路2号',
      openTime: '09:00-17:00（周一闭馆）',
      ticketInfo: '免费，需预约',
      categoryId: 4,
    },
    {
      name: '越秀公园',
      description: '越秀公园是广州最大的综合性公园，园内有著名的五羊石像，是广州城市标志之一。公园历史悠久，自然风光优美。',
      address: '广州市越秀区解放北路988号',
      openTime: '06:00-21:00',
      ticketInfo: '免费',
      categoryId: 5,
    },
  ]

  for (const attr of attractions) {
    await prisma.attraction.create({
      data: attr,
    })
  }

  // 创建美食数据
  const foods = [
    {
      name: '白切鸡',
      description: '白切鸡是广东最经典的粤菜之一，选用优质清远鸡，皮爽肉滑，原汁原味，配以姜葱蓉蘸料，是广州人宴请宾客的必备菜品。',
      categoryId: 10,
    },
    {
      name: '虾饺',
      description: '虾饺是广式早茶的代表点心，外皮晶莹剔透，内馅鲜虾爽口，是检验茶楼点心水平的标准之一。',
      categoryId: 11,
    },
    {
      name: '肠粉',
      description: '肠粉是广州著名的传统小吃，米浆蒸制而成的粉皮包裹着鲜虾、牛肉或叉烧，淋上特制酱油，口感爽滑。',
      categoryId: 12,
    },
    {
      name: '叉烧',
      description: '叉烧是粤菜中的经典烧味，选用上等猪肉，以蜜汁腌制后烤制，色泽红亮，肉质鲜嫩，甜中带咸。',
      categoryId: 10,
    },
    {
      name: '双皮奶',
      description: '双皮奶是广东传统甜品，以水牛奶为原料，经过两次结皮制成，口感香滑细腻，是广州最受欢迎的糖水之一。',
      categoryId: 13,
    },
    {
      name: '艇仔粥',
      description: '艇仔粥是广州传统名小吃，粥底绵滑，配料丰富，有鱼片、蛋丝、油条、花生等，味道鲜美。',
      categoryId: 12,
    },
  ]

  for (const food of foods) {
    await prisma.food.create({
      data: food,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
