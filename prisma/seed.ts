﻿﻿﻿import { PrismaClient } from '@prisma/client'
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

  // 创建普通测试用户
  const userPassword = await bcrypt.hash('user123', 10)
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      nickname: '测试用户',
      role: 'USER',
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
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    })
    if (!existing) {
      await prisma.category.create({ data: cat })
    }
  }

  // 创建美食分类
  const foodCategories = [
    { name: '粤菜', type: 'FOOD' as const, sort: 10 },
    { name: '早茶点心', type: 'FOOD' as const, sort: 11 },
    { name: '特色小吃', type: 'FOOD' as const, sort: 12 },
    { name: '甜品糖水', type: 'FOOD' as const, sort: 13 },
  ]

  for (const cat of foodCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    })
    if (!existing) {
      await prisma.category.create({ data: cat })
    }
  }

  // 获取所有分类的映射
  const allCategories = await prisma.category.findMany()
  const categoryMap = new Map(allCategories.map(c => [c.name, c.id]))

  // 创建景点数据
  const attractions = [
    {
      name: '广州塔',
      description: '广州塔，昵称小蛮腰，是广州市的地标性建筑，塔高600米，是中国第一高塔。广州塔集观光、餐饮、娱乐于一体，拥有世界最高的户外观景平台和摩天轮。',
      address: '广州市海珠区阅江西路222号',
      openTime: '09:30-22:30',
      ticketInfo: '成人票150元起',
      categoryName: '现代地标',
    },
    {
      name: '陈家祠',
      description: '陈家祠，又名陈氏书院，是广东现存规模最大、保存最完整、装饰最精美的传统岭南祠堂式建筑，被誉为"岭南建筑艺术明珠"。',
      address: '广州市荔湾区中山七路恩龙里34号',
      openTime: '08:30-17:30',
      ticketInfo: '成人票10元',
      categoryName: '历史古迹',
    },
    {
      name: '白云山',
      description: '白云山是广州著名的风景名胜区，自古就有"羊城第一秀"之称。山上空气清新，植被茂密，是广州市民休闲健身的好去处。',
      address: '广州市白云区广园中路白云山景区',
      openTime: '06:00-22:00',
      ticketInfo: '门票5元，索道另收费',
      categoryName: '自然风光',
    },
    {
      name: '沙面岛',
      description: '沙面岛是广州著名的历史文化街区，岛上保存了大量欧式建筑，是广州近代史的重要见证，现为国家5A级旅游景区。',
      address: '广州市荔湾区沙面大街',
      openTime: '全天开放',
      ticketInfo: '免费',
      categoryName: '历史古迹',
    },
    {
      name: '广东省博物馆',
      description: '广东省博物馆是广东省唯一的省级综合博物馆，馆藏丰富，展示了广东的历史文化和自然资源。新馆建筑造型独特，被称为"月光宝盒"。',
      address: '广州市天河区珠江东路2号',
      openTime: '09:00-17:00（周一闭馆）',
      ticketInfo: '免费，需预约',
      categoryName: '文化场馆',
    },
    {
      name: '越秀公园',
      description: '越秀公园是广州最大的综合性公园，园内有著名的五羊石像，是广州城市标志之一。公园历史悠久，自然风光优美。',
      address: '广州市越秀区解放北路988号',
      openTime: '06:00-21:00',
      ticketInfo: '免费',
      categoryName: '休闲公园',
    },
  ]

  for (const attr of attractions) {
    const existing = await prisma.attraction.findFirst({
      where: { name: attr.name }
    })
    if (!existing) {
      await prisma.attraction.create({
        data: {
          name: attr.name,
          description: attr.description,
          address: attr.address,
          openTime: attr.openTime,
          ticketInfo: attr.ticketInfo,
          categoryId: categoryMap.get(attr.categoryName)!,
        },
      })
    }
  }

  // 创建美食数据
  const foods = [
    {
      name: '白切鸡',
      description: '白切鸡是广东最经典的粤菜之一，选用优质清远鸡，皮爽肉滑，原汁原味，配以姜葱蓉蘸料，是广州人宴请宾客的必备菜品。',
      categoryName: '粤菜',
    },
    {
      name: '虾饺',
      description: '虾饺是广式早茶的代表点心，外皮晶莹剔透，内馅鲜虾爽口，是检验茶楼点心水平的标准之一。',
      categoryName: '早茶点心',
    },
    {
      name: '肠粉',
      description: '肠粉是广州著名的传统小吃，米浆蒸制而成的粉皮包裹着鲜虾、牛肉或叉烧，淋上特制酱油，口感爽滑。',
      categoryName: '特色小吃',
    },
    {
      name: '叉烧',
      description: '叉烧是粤菜中的经典烧味，选用上等猪肉，以蜜汁腌制后烤制，色泽红亮，肉质鲜嫩，甜中带咸。',
      categoryName: '粤菜',
    },
    {
      name: '双皮奶',
      description: '双皮奶是广东传统甜品，以水牛奶为原料，经过两次结皮制成，口感香滑细腻，是广州最受欢迎的糖水之一。',
      categoryName: '甜品糖水',
    },
    {
      name: '艇仔粥',
      description: '艇仔粥是广州传统名小吃，粥底绵滑，配料丰富，有鱼片、蛋丝、油条、花生等，味道鲜美。',
      categoryName: '特色小吃',
    },
  ]

  for (const food of foods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name }
    })
    if (!existing) {
      await prisma.food.create({
        data: {
          name: food.name,
          description: food.description,
          categoryId: categoryMap.get(food.categoryName)!,
        },
      })
    }
  }

  // 创建文化分类
  const cultures = [
    {
      name: '岭南文化',
      description: '岭南文化是中华文化的重要组成部分，具有鲜明的地域特色。岭南地区包括广东、广西、海南等地，形成了独特的语言、饮食、建筑、艺术等文化体系。',
      icon: '🏛️',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lingnan%20culture%20architecture%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      name: '粤剧艺术',
      description: '粤剧是广东传统戏曲剧种，又称"广东大戏"，是岭南文化的瑰宝。粤剧融合了唱、做、念、打等表演艺术，以其独特的唱腔和表演风格闻名于世。',
      icon: '🎭',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20opera%20performance%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      name: '醒狮文化',
      description: '醒狮是广东传统民俗活动，又称"南狮"，是岭南文化的重要组成部分。醒狮表演融合了武术、舞蹈、音乐等元素，象征着吉祥如意、驱邪避害。',
      icon: '🦁',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lion%20dance%20performance%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      name: '龙舟竞渡',
      description: '龙舟竞渡是端午节的传统活动，在广州有着悠久的历史。每年端午节，珠江上都会举办盛大的龙舟比赛，吸引众多市民和游客观看。',
      icon: '🚣',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon%20boat%20race%20on%20Pearl%20River%20Guangzhou&image_size=landscape_16_9',
    },
    {
      name: '广府建筑',
      description: '广府建筑是岭南建筑的代表，包括骑楼、西关大屋、镬耳墙等特色建筑形式。这些建筑融合了中西方建筑风格，体现了岭南人民的智慧和审美。',
      icon: '🏘️',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Cantonese%20architecture%20Qilou%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      name: '茶文化',
      description: '广州早茶文化源远流长，"一盅两件"是广州人生活方式的代表。在广州，早茶不仅是饮食文化，更是一种社交方式和生活态度。',
      icon: '🍵',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20morning%20tea%20dim%20sum%20in%20Guangzhou&image_size=landscape_16_9',
    },
  ]

  const createdCultures: { id: number; name: string }[] = []
  for (const culture of cultures) {
    const existing = await prisma.culture.findFirst({
      where: { name: culture.name }
    })
    if (existing) {
      createdCultures.push(existing)
    } else {
      const created = await prisma.culture.create({
        data: culture,
      })
      createdCultures.push(created)
    }
  }

  // 创建文化项目数据
  const cultureItems = [
    {
      cultureName: '岭南文化',
      name: '陈家祠',
      description: '陈家祠是广州著名的传统建筑，展示了岭南地区的建筑艺术和工艺精华。陈家祠建于清光绪年间，是广东七十二县陈姓宗亲合资兴建的合族祠，被誉为"岭南建筑艺术的明珠"。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chen%20Clan%20Ancestral%20Hall%20in%20Guangzhou%20traditional%20Chinese%20architecture&image_size=landscape_16_9',
    },
    {
      cultureName: '岭南文化',
      name: '岭南印象园',
      description: '岭南印象园是一个展示岭南文化的主题公园，重现了岭南地区的传统生活场景。园区内有传统岭南建筑、民俗表演、手工艺品展示等，是了解岭南文化的重要场所。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lingnan%20Impression%20Park%20traditional%20Chinese%20village%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '岭南文化',
      name: '南海神庙',
      description: '南海神庙是广州最古老的寺庙之一，是海上丝绸之路的重要历史遗迹。始建于隋开皇年间，是古代中国海上贸易的重要象征，也是广州作为海上丝绸之路起点的历史见证。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanhai%20Temple%20ancient%20Chinese%20temple%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '粤剧艺术',
      name: '红线女艺术中心',
      description: '红线女艺术中心是为纪念著名粤剧表演艺术家红线女而建立的艺术场馆。红线女是粤剧界的传奇人物，她的表演艺术影响了几代粤剧演员，中心展示了她的艺术生涯和贡献。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hongxiannu%20Art%20Center%20Cantonese%20opera%20venue%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '粤剧艺术',
      name: '广东粤剧院',
      description: '广东粤剧院是广东省的专业粤剧表演团体，致力于粤剧的传承和发展。剧院拥有众多优秀的粤剧演员和剧目，是粤剧艺术的重要传承基地。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangdong%20Cantonese%20Opera%20House%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '醒狮文化',
      name: '黄飞鸿纪念馆',
      description: '黄飞鸿纪念馆展示了一代武术大师黄飞鸿的生平事迹和醒狮文化。黄飞鸿是岭南武术的代表人物，他的故事被多次改编成电影和电视剧，纪念馆展示了他的武术精神和醒狮文化的魅力。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huang%20Feihong%20Memorial%20Hall%20martial%20arts%20museum%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '醒狮文化',
      name: '醒狮表演',
      description: '广州各大景区和节庆活动中都有精彩的醒狮表演，展示了传统民俗文化的魅力。醒狮表演通常由两人合作完成，一人舞狮头，一人舞狮尾，通过各种高难度动作展现狮子的威猛和灵动。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lion%20dance%20performance%20during%20festival%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '龙舟竞渡',
      name: '珠江龙舟赛',
      description: '每年端午节期间，珠江上都会举办盛大的龙舟竞渡比赛，吸引众多市民和游客观看。龙舟竞渡是广州重要的传统习俗，象征着团结协作和奋勇争先的精神。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon%20boat%20race%20on%20Pearl%20River%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '龙舟竞渡',
      name: '龙舟制作工艺',
      description: '广州的龙舟制作工艺历史悠久，是岭南传统工艺的重要组成部分。龙舟的制作过程包括选料、设计、雕刻、彩绘等多个环节，体现了岭南工匠的精湛技艺。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon%20boat%20making%20craftsmanship%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '广府建筑',
      name: '骑楼街',
      description: '广州的骑楼街是岭南建筑的代表，集中在上下九、北京路等商业街区。骑楼的特点是一楼为商铺，二楼以上向外延伸，形成走廊，既可以遮阳避雨，又方便行人购物，是中西建筑文化融合的产物。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qilou%20buildings%20traditional%20arcade%20streets%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '广府建筑',
      name: '西关大屋',
      description: '西关大屋是广州传统民居的代表，展示了广府人家的生活方式和建筑艺术。西关大屋通常由多进院落组成，布局严谨，装饰精美，体现了广府人家的生活品味和文化底蕴。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiguan%20Mansion%20traditional%20Cantonese%20residence%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '广府建筑',
      name: '镬耳墙',
      description: '镬耳墙是广府建筑的标志性元素，因其形状像铁锅的耳朵而得名。镬耳墙具有防火、通风等功能，也是富贵的象征，常见于传统民居和祠堂建筑中，体现了岭南建筑的独特风格。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huoer%20walls%20traditional%20Cantonese%20architecture%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '茶文化',
      name: '陶陶居',
      description: '陶陶居是广州历史悠久的茶楼，以传统粤式点心和早茶文化闻名。陶陶居创立于清光绪年间，是广州早茶文化的代表之一，其点心制作精细，品种繁多，深受市民和游客喜爱。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taotaoju%20teahouse%20traditional%20Cantonese%20tea%20house%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '茶文化',
      name: '广州酒家',
      description: '广州酒家是广州著名的餐饮企业，以粤菜和早茶文化为特色。广州酒家创立于1935年，是广州饮食文化的代表之一，其菜品制作讲究，口味地道，是品尝正宗粤菜的好去处。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guangzhou%20Restaurant%20traditional%20Cantonese%20cuisine%20in%20Guangzhou&image_size=landscape_16_9',
    },
    {
      cultureName: '茶文化',
      name: '早茶文化体验',
      description: '在广州，早茶文化是一种生活方式，市民和游客可以在各大茶楼体验"一盅两件"的悠闲时光。早茶通常包括一壶茶和两件点心，是广州人社交、交流的重要场合，体现了广州人注重生活品质的特点。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20morning%20tea%20dim%20sum%20experience%20in%20Guangzhou&image_size=landscape_16_9',
    },
  ]

  for (const item of cultureItems) {
    const culture = createdCultures.find(c => c.name === item.cultureName)

    if (culture) {
      const existing = await prisma.cultureItem.findFirst({
        where: { name: item.name, cultureId: culture.id }
      })
      if (!existing) {
        await prisma.cultureItem.create({
          data: {
            name: item.name,
            description: item.description,
            image: item.image,
            cultureId: culture.id,
          },
        })
      }
    }
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
