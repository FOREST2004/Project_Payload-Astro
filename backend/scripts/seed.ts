import { createRequire } from 'node:module'
import { getPayload } from 'payload'
import { loadEnvConfig } from '@next/env'

const require = createRequire(import.meta.url)
const nextEnv = require('@next/env')

// Next env interop (có lúc module export default khác nhau)
if (nextEnv && !nextEnv.default) {
  nextEnv.default = nextEnv
}

async function findOrCreate<T extends { id: string }>(
  payload: any,
  collection: string,
  where: Record<string, any>,
  data: Record<string, any>,
): Promise<T> {
  const result = await payload.find({ collection, where, limit: 1, overrideAccess: true })
  if (result.docs?.[0]) return result.docs[0] as T
  return payload.create({ collection, data, overrideAccess: true }) as Promise<T>
}

async function upsertByWhere(
  payload: any,
  collection: string,
  where: Record<string, any>,
  createData: Record<string, any>,
  updateData: Record<string, any> = createData,
) {
  const existing = await payload.find({ collection, where, limit: 1, overrideAccess: true })
  const doc = existing.docs?.[0]

  if (doc) {
    return payload.update({
      collection,
      id: doc.id,
      data: updateData,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection,
    data: createData,
    overrideAccess: true,
  })
}

async function run() {
  loadEnvConfig(process.cwd())

  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  // ────────────────────────────────────────────────────────────────────────────
  // TENANTS
  // ────────────────────────────────────────────────────────────────────────────

  const funpark = await upsertByWhere(
    payload,
    'tenants',
    { slug: { equals: 'funpark' } },
    {
      name: 'VinWonders',
      slug: 'funpark',
      domain: 'vinwonders.local',
      public: true,
      contact: {
        phone: '0901 111 222',
        email: 'hello@vinwonders.local',
        address: 'VinWonders, Nha Trang, Khánh Hòa',
      },
    },
  )
  console.log('✓ Tenant: VinWonders')

  const busline = await upsertByWhere(
    payload,
    'tenants',
    { slug: { equals: 'busline' } },
    {
      name: 'Phương Trang',
      slug: 'busline',
      domain: 'phuongtrang.local',
      public: true,
      contact: {
        phone: '1900 6067',
        email: 'support@phuongtrang.local',
        address: 'Bến xe Miền Tây, TP. Hồ Chí Minh',
      },
    },
  )
  console.log('✓ Tenant: Phương Trang')

  // ────────────────────────────────────────────────────────────────────────────
  // USERS
  // ────────────────────────────────────────────────────────────────────────────

  await upsertByWhere(
    payload,
    'users',
    { email: { equals: 'admin@example.com' } },
    {
      email: 'admin@example.com',
      password: 'admin123',
      roles: ['super-admin'],
    },
    {
      // NOTE: password thường không update nếu đã tồn tại (tuỳ config/auth)
      email: 'admin@example.com',
      roles: ['super-admin'],
    },
  )
  console.log('✓ User: admin@example.com (password: admin123)')

  await upsertByWhere(
    payload,
    'users',
    { email: { equals: 'funpark@example.com' } },
    {
      email: 'funpark@example.com',
      password: 'test123',
      roles: ['user'],
      tenants: [{ tenant: funpark.id, roles: ['admin'] }],
    },
    {
      email: 'funpark@example.com',
      roles: ['user'],
      tenants: [{ tenant: funpark.id, roles: ['admin'] }],
    },
  )
  console.log('✓ User: funpark@example.com (password: test123)')

  await upsertByWhere(
    payload,
    'users',
    { email: { equals: 'busline@example.com' } },
    {
      email: 'busline@example.com',
      password: 'test123',
      roles: ['user'],
      tenants: [{ tenant: busline.id, roles: ['admin'] }],
    },
    {
      email: 'busline@example.com',
      roles: ['user'],
      tenants: [{ tenant: busline.id, roles: ['admin'] }],
    },
  )
  console.log('✓ User: busline@example.com (password: test123)')

  // ────────────────────────────────────────────────────────────────────────────
  // PAGES
  // ────────────────────────────────────────────────────────────────────────────

  const funparkPages = [
    {
      slug: 'home',
      title: 'Chào mừng đến VinWonders',
      content:
        'VinWonders – Thiên đường vui chơi giải trí hàng đầu Việt Nam.\nTrải nghiệm hàng trăm trò chơi, show diễn và khu vực tham quan độc đáo.',
    },
    {
      slug: 'about',
      title: 'Về chúng tôi',
      content:
        'VinWonders là hệ thống công viên giải trí đẳng cấp quốc tế do Vingroup phát triển.\nHiện có mặt tại Nha Trang, Phú Quốc, Hạ Long và Nam Hội An.\nMỗi khu đều mang đặc trưng văn hóa địa phương kết hợp với công nghệ giải trí hiện đại.',
    },
    {
      slug: 'tickets',
      title: 'Mua vé',
      content:
        'Đặt vé trực tuyến để nhận ưu đãi lên đến 20%.\nVé có hiệu lực trong ngày, không hoàn tiền sau khi sử dụng.\nTrẻ em dưới 100cm miễn phí vào cửa.',
    },
    {
      slug: 'contact',
      title: 'Liên hệ',
      content:
        'Hotline: 0901 111 222 (7:00 – 22:00 hàng ngày)\nEmail: hello@vinwonders.local\nĐịa chỉ: VinWonders, Nha Trang, Khánh Hòa\nFanpage: facebook.com/vinwonders',
    },
  ]

  for (const page of funparkPages) {
    await upsertByWhere(
      payload,
      'pages',
      { and: [{ slug: { equals: page.slug } }, { tenant: { equals: funpark.id } }] },
      { ...page, tenant: funpark.id },
    )
  }
  console.log(`✓ Pages VinWonders: ${funparkPages.length} trang`)

  const buslinePages = [
    {
      slug: 'home',
      title: 'Phương Trang – Xe khách chất lượng cao',
      content:
        'Hơn 20 năm phục vụ hành khách trên toàn quốc.\nĐặt vé dễ dàng, chất lượng dịch vụ hàng đầu.',
    },
    {
      slug: 'about',
      title: 'Giới thiệu Phương Trang',
      content:
        'Công ty TNHH Xe khách Phương Trang (FUTA Bus Lines) thành lập năm 2001.\nMạng lưới hơn 60 tuyến cố định trên toàn quốc.\nĐội xe hiện đại với hơn 2.000 xe, phục vụ hàng triệu lượt khách mỗi năm.',
    },
    {
      slug: 'schedule',
      title: 'Lịch trình & Tuyến đường',
      content:
        'Tra cứu lịch khởi hành theo tuyến và giờ chạy.\nCác tuyến phổ biến: TP.HCM – Đà Lạt, TP.HCM – Nha Trang, Hà Nội – Đà Nẵng.\nXe khởi hành đúng giờ, có GPS theo dõi hành trình.',
    },
    {
      slug: 'policy',
      title: 'Chính sách & Điều khoản',
      content:
        'Chính sách đổi/hoàn vé: trước 24 giờ khởi hành được hoàn 70% giá vé.\nHành lý: tối đa 20kg hành lý ký gửi, 7kg hành lý xách tay.\nKhách đến bến xe trước giờ khởi hành tối thiểu 15 phút.',
    },
    {
      slug: 'contact',
      title: 'Liên hệ',
      content:
        'Tổng đài: 1900 6067 (6:00 – 22:00 hàng ngày)\nEmail: support@phuongtrang.local\nVăn phòng chính: Bến xe Miền Tây, TP. Hồ Chí Minh',
    },
  ]

  for (const page of buslinePages) {
    await upsertByWhere(
      payload,
      'pages',
      { and: [{ slug: { equals: page.slug } }, { tenant: { equals: busline.id } }] },
      { ...page, tenant: busline.id },
    )
  }
  console.log(`✓ Pages Phương Trang: ${buslinePages.length} trang`)

  // ────────────────────────────────────────────────────────────────────────────
  // SITE SETTINGS  (schema mới: header/theme/footer đều là group)
  // ────────────────────────────────────────────────────────────────────────────

  await upsertByWhere(
    payload,
    'site-settings',
    { tenant: { equals: funpark.id } },
    {
      tenant: funpark.id,
      header: {
        enabled: true,
        topBar: {
          enabled: true,
          leftText: 'Ưu đãi mùa lễ hội',
          rightText: 'Hotline: 0901 111 222',
        },
        logoText: 'VinWonders',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Mua vé', url: '/tickets' },
        ],
      },
      theme: {
        primaryColor: '#e84118',
        darkColor: '#1a1a2e',
        heroBgFrom: '#e84118',
        heroBgTo: '#ffb347',
        fontFamily: 'segoe',
      },
      footer: {
        enabled: true,
        copyrightText: '',
        columns: [
          { title: 'Hotline', contentSource: 'tenant', tenantFieldPath: 'contact.phone' },
          { title: 'Email', contentSource: 'tenant', tenantFieldPath: 'contact.email' },
          { title: 'Địa chỉ', contentSource: 'tenant', tenantFieldPath: 'contact.address' },
          {
            title: 'Giờ mở cửa',
            contentSource: 'custom',
            content: 'T2–T6: 9:00–18:00\nT7–CN: 9:00–21:00',
          },
        ],
      },
    },
  )
  console.log('✓ SiteSettings: VinWonders')

  await upsertByWhere(
    payload,
    'site-settings',
    { tenant: { equals: busline.id } },
    {
      tenant: busline.id,
      header: {
        enabled: true,
        topBar: {
          enabled: true,
          leftText: 'Đặt vé nhanh - đi an toàn',
          rightText: 'Hotline: 1900 6067',
        },
        logoText: 'Phương Trang',
        navLinks: [
          { label: 'Trang chủ', url: '/' },
          { label: 'Lịch trình', url: '/tickets' },
        ],
      },
      theme: {
        primaryColor: '#16a34a',
        darkColor: '#0b1220',
        heroBgFrom: '#16a34a',
        heroBgTo: '#86efac',
        fontFamily: 'inter',
      },
      footer: {
        enabled: true,
        copyrightText: '',
        columns: [
          { title: 'Hotline', contentSource: 'tenant', tenantFieldPath: 'contact.phone' },
          { title: 'Email', contentSource: 'tenant', tenantFieldPath: 'contact.email' },
          { title: 'Văn phòng', contentSource: 'tenant', tenantFieldPath: 'contact.address' },
          {
            title: 'Hỗ trợ',
            contentSource: 'custom',
            content: 'Chính sách đổi vé\nĐiều khoản\nLiên hệ',
          },
        ],
      },
    },
  )
  console.log('✓ SiteSettings: Phương Trang')

  // ────────────────────────────────────────────────────────────────────────────
  // TICKETS – VinWonders
  // ────────────────────────────────────────────────────────────────────────────

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
      payload,
      'tickets',
      { and: [{ name: { equals: ticket.name } }, { tenant: { equals: funpark.id } }] },
      { ...ticket, status: 'active', tenant: funpark.id },
    )
  }
  console.log(`✓ Tickets VinWonders: ${funparkTickets.length} vé`)

  // ────────────────────────────────────────────────────────────────────────────
  // TICKETS – Phương Trang
  // ────────────────────────────────────────────────────────────────────────────

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
      payload,
      'tickets',
      { and: [{ name: { equals: ticket.name } }, { tenant: { equals: busline.id } }] },
      { ...ticket, status: 'active', tenant: busline.id },
    )
  }
  console.log(`✓ Tickets Phương Trang: ${buslineTickets.length} vé`)

  // ────────────────────────────────────────────────────────────────────────────
  // ORDERS – VinWonders
  // ────────────────────────────────────────────────────────────────────────────

  const ticketAdult = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'Vé người lớn' } }, { tenant: { equals: funpark.id } }] },
    limit: 1,
    overrideAccess: true,
  })
  const ticketVIP = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'Vé VIP người lớn' } }, { tenant: { equals: funpark.id } }] },
    limit: 1,
    overrideAccess: true,
  })
  const ticketFamily = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'Vé gia đình (2+2)' } }, { tenant: { equals: funpark.id } }] },
    limit: 1,
    overrideAccess: true,
  })

  const funparkOrders = [
    {
      orderCode: 'FP-2024-0001',
      tenant: funpark.id,
      ticket: ticketAdult.docs?.[0]?.id,
      buyerName: 'Nguyễn Văn An',
      buyerEmail: 'an.nguyen@gmail.com',
      buyerPhone: '0912345678',
      quantity: 2,
      totalAmount: 400000,
    },
    {
      orderCode: 'FP-2024-0002',
      tenant: funpark.id,
      ticket: ticketVIP.docs?.[0]?.id,
      buyerName: 'Trần Thị Bình',
      buyerEmail: 'binh.tran@gmail.com',
      buyerPhone: '0987654321',
      quantity: 1,
      totalAmount: 450000,
    },
    {
      orderCode: 'FP-2024-0003',
      tenant: funpark.id,
      ticket: ticketFamily.docs?.[0]?.id,
      buyerName: 'Lê Minh Cường',
      buyerEmail: 'cuong.le@gmail.com',
      buyerPhone: '0901234567',
      quantity: 1,
      totalAmount: 500000,
    },
  ]

  for (const order of funparkOrders) {
    await findOrCreate(
      payload,
      'orders',
      { orderCode: { equals: order.orderCode } },
      order,
    )
  }
  console.log(`✓ Orders VinWonders: ${funparkOrders.length} đơn`)

  // ────────────────────────────────────────────────────────────────────────────
  // ORDERS – Phương Trang
  // ────────────────────────────────────────────────────────────────────────────

  const ticketSGDL = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'TP. HCM → Đà Lạt' } }, { tenant: { equals: busline.id } }] },
    limit: 1,
    overrideAccess: true,
  })
  const ticketSGNT = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'TP. HCM → Nha Trang' } }, { tenant: { equals: busline.id } }] },
    limit: 1,
    overrideAccess: true,
  })
  const ticketSGVT = await payload.find({
    collection: 'tickets',
    where: { and: [{ name: { equals: 'TP. HCM → Vũng Tàu' } }, { tenant: { equals: busline.id } }] },
    limit: 1,
    overrideAccess: true,
  })

  const buslineOrders = [
    {
      orderCode: 'BL-2024-0001',
      tenant: busline.id,
      ticket: ticketSGDL.docs?.[0]?.id,
      buyerName: 'Phạm Thị Dung',
      buyerEmail: 'dung.pham@gmail.com',
      buyerPhone: '0933445566',
      quantity: 2,
      totalAmount: 400000,
    },
    {
      orderCode: 'BL-2024-0002',
      tenant: busline.id,
      ticket: ticketSGNT.docs?.[0]?.id,
      buyerName: 'Hoàng Văn Em',
      buyerEmail: 'em.hoang@gmail.com',
      buyerPhone: '0944556677',
      quantity: 1,
      totalAmount: 280000,
    },
    {
      orderCode: 'BL-2024-0003',
      tenant: busline.id,
      ticket: ticketSGVT.docs?.[0]?.id,
      buyerName: 'Vũ Thị Phương',
      buyerEmail: 'phuong.vu@gmail.com',
      buyerPhone: '0955667788',
      quantity: 3,
      totalAmount: 360000,
    },
  ]

  for (const order of buslineOrders) {
    await findOrCreate(
      payload,
      'orders',
      { orderCode: { equals: order.orderCode } },
      order,
    )
  }
  console.log(`✓ Orders Phương Trang: ${buslineOrders.length} đơn`)

  console.log('\n✅ Seed hoàn tất!')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})