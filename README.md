# Project Payload-Astro

Nền tảng bán vé sự kiện multi-tenant, xây dựng bằng **Payload CMS** (backend) và **Astro + React** (frontend).

---

## Kiến trúc tổng quan

```
backend/  → Payload CMS (Next.js) — API, Admin panel, DB
frontend/ → Astro SSR + React islands — Giao diện người dùng
```

Mỗi tenant có dữ liệu độc lập: trang, vé, đơn hàng, cài đặt giao diện.

---

## Backend (Payload CMS)

### Collections

| Collection | Mô tả |
|---|---|
| `Tenants` | Tổ chức/sự kiện: tên, slug, domain, contact, ảnh quảng cáo |
| `Users` | Tài khoản admin, phân quyền theo tenant |
| `Pages` | Trang nội dung CMS (home, giới thiệu...) |
| `Tickets` | Vé bán theo tenant (tên, giá, trạng thái) |
| `Orders` | Đơn đặt vé (mã đơn, người mua) |
| `SiteSettings` | Cài đặt giao diện per-tenant (màu, font, header, footer) |
| `Media` | Ảnh upload, lưu tại `backend/publics/images/` |

### Biến môi trường (`backend/.env`)

```env
DATABASE_URI=postgresql://user:pass@localhost:5432/dbname
PAYLOAD_SECRET=your-secret-min-32-chars
FRONTEND_URL=http://localhost:4321
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

### Chạy backend

```bash
cd backend
npm install
npm run seed       # Seed dữ liệu mẫu
npm run dev        # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`

### Dữ liệu mẫu sau khi seed

#### Tài khoản đăng nhập

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@example.com` | `admin123` | Super Admin (toàn quyền) |
| `funpark@example.com` | `test123` | Admin tenant VinWonders |
| `busline@example.com` | `test123` | Admin tenant Phương Trang |

#### Tenants

| Tenant | Slug | Domain |
|---|---|---|
| VinWonders | `funpark` | `vinwonders.local` |
| Phương Trang | `busline` | `phuongtrang.local` |

#### Dữ liệu được tạo

| | VinWonders | Phương Trang |
|---|---|---|
| Pages | 4 trang (home, about, tickets, contact) | 5 trang (home, about, schedule, policy, contact) |
| Tickets | 25 loại vé | 20 tuyến xe |
| Orders | 3 đơn mẫu | 3 đơn mẫu |

---

## Frontend (Astro + React)

### Pages

| Route | File | Mô tả |
|---|---|---|
| `/` | `index.astro` | Trang chủ: hero, gallery ảnh, contact |
| `/tickets` | `tickets.astro` | Danh sách vé, mua vé |
| `/[slug]` | `[slug].astro` | Trang CMS động |
| `POST /api/orders` | `api/orders.ts` | API tạo đơn hàng |

### Components & Directives

| Component | Loại | Directive | Khi hydrate |
|---|---|---|---|
| `Layout.astro` | Astro | — | Không (server only) |
| `Header.astro` | Astro | — | Không (server only) |
| `Footer.astro` | Astro | — | Không (server only) |
| `HeroSection.tsx` | React | `client:load` | Ngay khi page load |
| `ImageGallery.tsx` | React | `client:idle` | Khi browser rảnh |
| `TicketCard.tsx` | React | `client:visible` | Khi scroll vào viewport |
| `MobileNav.tsx` | React | `client:media="(max-width: 640px)"` | Chỉ trên màn hình ≤ 640px |

### Biến môi trường (`frontend/.env`)

```env
PAYLOAD_API_URL=http://localhost:3000
```

### Chạy frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:4321
```

---

## Flow đặt vé

```
User bấm "Mua ngay" (TicketCard)
  → Điền form (tên, email, SĐT)
  → POST /api/orders (Astro API route)
    → Validate dữ liệu
    → Generate mã đơn (ORD-YYYYMMDD-XXXXX)
    → POST backend/api/orders (Payload)
  → Hiển thị mã đơn hàng
```


---

## Tech Stack

| | Công nghệ |
|---|---|
| Backend | Payload CMS 3.x, Next.js 15, TypeScript |
| Frontend | Astro 4, React 19, TypeScript |
| Database | PostgreSQL |
| File upload | Local (`publics/images/`) |
