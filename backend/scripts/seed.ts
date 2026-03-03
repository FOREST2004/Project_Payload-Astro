import { createRequire } from 'node:module'
import { getPayload } from 'payload'
import { loadEnvConfig } from '@next/env'

const require = createRequire(import.meta.url)
const nextEnv = require('@next/env')

if (nextEnv && !nextEnv.default) {
  nextEnv.default = nextEnv
}

async function findOrCreate<T extends { id: string }>(
  payload: any,
  collection: string,
  where: Record<string, any>,
  data: Record<string, any>,
): Promise<T> {
  const result = await payload.find({ collection, where, limit: 1 })
  if (result.docs[0]) return result.docs[0] as T
  return payload.create({ collection, data }) as Promise<T>
}

async function run() {
  loadEnvConfig(process.cwd())
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  // ── TENANTS ─────────────────────────────────────────────────────────────────

  const funpark = await findOrCreate(payload, 'tenants', { slug: { equals: 'funpark' } }, {
    name: 'VinWonders',
    slug: 'funpark',
    domain: 'vinwonders.local',
    public: true,
  })
  console.log('✓ Tenant: VinWonders')

  const busline = await findOrCreate(payload, 'tenants', { slug: { equals: 'busline' } }, {
    name: 'Phương Trang',
    slug: 'busline',
    domain: 'phuongtrang.local',
    public: true,
  })
  console.log('✓ Tenant: Phương Trang')

  // ── USERS ────────────────────────────────────────────────────────────────────

  await findOrCreate(payload, 'users', { email: { equals: 'admin@example.com' } }, {
    email: 'demo@payloadcms.com',
    password: 'test',
    roles: ['super-admin'],
  })
  console.log('✓ User: admin@example.com (password: admin123)')

  await findOrCreate(payload, 'users', { email: { equals: 'funpark@example.com' } }, {
    email: 'funpark@example.com',
    password: 'test123',
    roles: ['user'],
    tenants: [{ tenant: funpark.id, roles: ['admin'] }],
  })
  console.log('✓ User: funpark@example.com')

  await findOrCreate(payload, 'users', { email: { equals: 'busline@example.com' } }, {
    email: 'busline@example.com',
    password: 'test123',
    roles: ['user'],
    tenants: [{ tenant: busline.id, roles: ['admin'] }],
  })
  console.log('✓ User: busline@example.com')

  // ── PAGES ────────────────────────────────────────────────────────────────────

  await findOrCreate(
    payload, 'pages',
    { and: [{ slug: { equals: 'home' } }, { tenant: { equals: funpark.id } }] },
    {
      title: 'Chào mừng đến VinWonders',
      slug: 'home',
      content: 'VinWonders – Thiên đường vui chơi giải trí hàng đầu Việt Nam.\nTrải nghiệm hàng trăm trò chơi, show diễn và khu vực tham quan độc đáo.',
      tenant: funpark.id,
    },
  )
  console.log('✓ Page: VinWonders home')

  await findOrCreate(
    payload, 'pages',
    { and: [{ slug: { equals: 'home' } }, { tenant: { equals: busline.id } }] },
    {
      title: 'Phương Trang – Xe khách chất lượng cao',
      slug: 'home',
      content: 'Hơn 20 năm phục vụ hành khách trên toàn quốc.\nĐặt vé dễ dàng, chất lượng dịch vụ hàng đầu.',
      tenant: busline.id,
    },
  )
  console.log('✓ Page: Phương Trang home')

  // ── SITE SETTINGS ────────────────────────────────────────────────────────────

  const funparkSettings = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: funpark.id } },
    limit: 1,
  })
  if (funparkSettings.docs[0]) {
    await payload.update({
      collection: 'site-settings',
      id: funparkSettings.docs[0].id,
      data: {
        logoText: 'VinWonders',
        primaryColor: '#e84118',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Mua vé', url: '/tickets' },
        ],
      },
    })
  } else {
    await payload.create({
      collection: 'site-settings',
      data: {
        tenant: funpark.id,
        logoText: 'VinWonders',
        primaryColor: '#e84118',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Mua vé', url: '/tickets' },
        ],
      },
    })
  }
  console.log('✓ SiteSettings: VinWonders')

  const buslineSettings = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: busline.id } },
    limit: 1,
  })
  if (buslineSettings.docs[0]) {
    await payload.update({
      collection: 'site-settings',
      id: buslineSettings.docs[0].id,
      data: {
        logoText: 'Phương Trang',
        primaryColor: '#16a34a',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Lịch trình', url: '/tickets' },
        ],
      },
    })
  } else {
    await payload.create({
      collection: 'site-settings',
      data: {
        tenant: busline.id,
        logoText: 'Phương Trang',
        primaryColor: '#16a34a',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Lịch trình', url: '/tickets' },
        ],
      },
    })
  }
  console.log('✓ SiteSettings: Phương Trang')

  // ── TICKETS – VinWonders ─────────────────────────────────────────────────────

  const funparkTickets = [
    { name: 'Vé người lớn', description: 'Vào cửa toàn khu, từ 18 tuổi trở lên', price: 200000 },
    { name: 'Vé trẻ em', description: 'Áp dụng cho trẻ từ 3–17 tuổi', price: 150000 },
    { name: 'Vé gia đình (2+2)', description: 'Combo tiết kiệm 2 người lớn + 2 trẻ em', price: 500000 },
    { name: 'Vé VIP người lớn', description: 'Vào cửa + ưu tiên xếp hàng + buffet trưa', price: 450000 },
    { name: 'Vé nhóm 5 người', description: 'Nhóm từ 5 người, tiết kiệm 15%', price: 850000 },
    { name: 'Vé khu nước Water World', description: 'Toàn bộ khu trò chơi nước', price: 250000 },
    { name: 'Vé tàu lượn siêu tốc', description: '3 lần liên tiếp (trên 140cm)', price: 150000 },
    { name: 'Vé show biểu diễn lửa', description: 'Ngoài trời lúc 20:00, 60 phút', price: 180000 },
    { name: 'Vé VR Zone', description: '5 trải nghiệm thực tế ảo (~45 phút)', price: 200000 },
    { name: 'Vé zipline', description: 'Cáp trượt 300m, cao 30m, có đai an toàn', price: 220000 },
    { name: 'Vé leo núi nhân tạo', description: 'Tường 15m, có huấn luyện viên', price: 120000 },
    { name: 'Vé karting', description: 'Đua xe mini 5 vòng, đường đua 400m', price: 130000 },
    { name: 'Vé kayak hồ nhân tạo', description: 'Chèo thuyền kayak trên hồ 2ha', price: 110000 },
    { name: 'Vé 4D Cinema', description: 'Ghế rung, gió, nước – 30 phút mỗi suất', price: 85000 },
    { name: 'Vé nhảy dù trong nhà', description: 'Tự do trên luồng gió 180km/h', price: 350000 },
    { name: 'Vé nhà ma kinh dị', description: 'Chủ đề Halloween, không phù hợp trẻ dưới 12', price: 100000 },
    { name: 'Vé vườn thú mini', description: 'Tham quan 30 loài động vật', price: 80000 },
    { name: 'Vé bắn cung', description: '30 phút với huấn luyện viên', price: 90000 },
    { name: 'Vé khu trẻ em indoor', description: 'Điều hòa, dành cho trẻ 2–10 tuổi', price: 70000 },
    { name: 'Vé lướt sóng nhân tạo', description: 'Máy tạo sóng, có huấn luyện viên', price: 180000 },
    { name: 'Vé năm (Annual Pass)', description: 'Vào cổng không giới hạn 12 tháng', price: 1200000 },
    { name: 'Gói sinh nhật VIP', description: 'Vé + bánh sinh nhật + ghế ưu tiên show', price: 650000 },
    { name: 'Vé cắm trại qua đêm', description: 'Lều + BBQ tối + điểm tâm sáng + vé hôm sau', price: 800000 },
    { name: 'Vé fastpass (không xếp hàng)', description: 'Ưu tiên 10 trò chơi hot nhất', price: 400000 },
    { name: 'Vé đêm Weekend', description: '17:00–22:00 thứ 6, 7, CN', price: 180000 },
  ]

  for (const ticket of funparkTickets) {
    await findOrCreate(
      payload, 'tickets',
      { and: [{ name: { equals: ticket.name } }, { tenant: { equals: funpark.id } }] },
      { ...ticket, status: 'active', tenant: funpark.id },
    )
  }
  console.log(`✓ Tickets VinWonders: ${funparkTickets.length} vé`)

  // ── TICKETS – Phương Trang ───────────────────────────────────────────────────

  const buslineTickets = [
    { name: 'Hà Nội → TP. Hồ Chí Minh', description: 'Xe limousine giường nằm, khởi hành 19:00', price: 350000 },
    { name: 'TP. HCM → Đà Lạt', description: 'Xe ghế ngồi cao cấp, 7:00 và 13:00', price: 200000 },
    { name: 'TP. HCM → Vũng Tàu', description: 'Xe đi nhanh, mỗi 30 phút', price: 120000 },
    { name: 'TP. HCM → Cần Thơ', description: 'Xe giường nằm, 6:30 và 14:00', price: 180000 },
    { name: 'TP. HCM → Nha Trang', description: 'Xe limousine VIP, khởi hành 20:00', price: 280000 },
    { name: 'TP. HCM → Phan Thiết', description: 'Xe ghế nằm, 7:00 / 10:00 / 14:00', price: 150000 },
    { name: 'TP. HCM → Đà Nẵng', description: 'Limousine 2 tầng VIP, 19:30 (~15 tiếng)', price: 380000 },
    { name: 'TP. HCM → Huế', description: 'Xe giường nằm, 18:00 (~16 tiếng)', price: 400000 },
    { name: 'Đà Lạt → TP. HCM', description: 'Chiều về, 7:00 và 14:00', price: 200000 },
    { name: 'Hà Nội → Đà Nẵng', description: 'Xe giường nằm 2 tầng, 18:00', price: 320000 },
    { name: 'Hà Nội → Sa Pa', description: 'Limousine VIP 9 chỗ, 22:00, WiFi', price: 280000 },
    { name: 'Hà Nội → Hải Phòng', description: 'Xe ghế ngồi, mỗi giờ từ 6:00–18:00', price: 100000 },
    { name: 'Đà Nẵng → Hội An', description: 'Xe mini 16 chỗ, mỗi 30 phút', price: 60000 },
    { name: 'Đà Nẵng → Huế', description: 'Xe ghế ngồi, mỗi giờ (~2.5 tiếng)', price: 90000 },
    { name: 'Nha Trang → Đà Lạt', description: 'Xe ghế nằm, 7:30 và 13:00', price: 130000 },
    { name: 'TP. HCM → Cà Mau', description: 'Xe giường 2 tầng, 20:00 (~7 tiếng)', price: 260000 },
    { name: 'TP. HCM → Phú Quốc (xe+phà)', description: 'Đón tại Bến xe Miền Tây', price: 350000 },
    { name: 'TP. HCM → Mỹ Tho', description: 'Xe ghế nhanh, mỗi 30 phút từ 5:30', price: 65000 },
    { name: 'TP. HCM → Quy Nhơn', description: 'Xe giường VIP, 19:00 (~10 tiếng)', price: 320000 },
    { name: 'TP. HCM → Buôn Ma Thuột', description: 'Limousine giường nằm, 20:00', price: 270000 },
  ]

  for (const ticket of buslineTickets) {
    await findOrCreate(
      payload, 'tickets',
      { and: [{ name: { equals: ticket.name } }, { tenant: { equals: busline.id } }] },
      { ...ticket, status: 'active', tenant: busline.id },
    )
  }
  console.log(`✓ Tickets Phương Trang: ${buslineTickets.length} vé`)

  console.log('\n✅ Seed hoàn tất!')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
