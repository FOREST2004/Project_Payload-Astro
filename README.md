# Project Payload-Astro

Nền tảng bán vé sự kiện **multi-tenant**, xây dựng bằng **Payload CMS** (backend) và **Astro + React** (frontend).

## Video demo

- Video chạy project và giải thích cách áp dụng Payload + Astro:: [https://youtu.be/wS47TI5uzuI](https://youtu.be/wS47TI5uzuI)

---

## Tổng quan hệ thống

Hệ thống cho phép nhiều **tenant** (tổ chức / sự kiện) cùng vận hành trên một nền tảng dùng chung, nhưng dữ liệu hoàn toàn độc lập với nhau. Mỗi tenant có trang web riêng, vé riêng, đơn hàng riêng và giao diện tuỳ chỉnh riêng.

### Phân quyền

| Vai trò | Quyền hạn |
|---|---|
| **Super Admin** | Toàn quyền: quản lý tất cả tenant, user, dữ liệu trên toàn hệ thống |
| **Tenant Admin** | Chỉ xem và quản lý dữ liệu thuộc tenant của mình |

### Tenant Admin có thể làm gì?

Mỗi tenant admin đăng nhập vào admin panel (`/admin`) và quản lý toàn bộ nội dung của tenant mình:

- **Trang nội dung (Pages)** — Tạo và chỉnh sửa các trang như trang chủ, giới thiệu, liên hệ. Nội dung hiển thị trực tiếp lên website.
- **Vé (Tickets)** — Thêm, sửa, xoá các loại vé: tên, mô tả, giá.
- **Đơn hàng (Orders)** — Xem danh sách đơn đặt vé từ khách hàng.
- **Ảnh quảng cáo (Media)** — Upload ảnh để hiển thị trên trang chủ dạng carousel.
- **Cài đặt giao diện (Site Settings)**:
  - Header: bật/tắt top bar, text thông báo, logo, menu điều hướng
  - Footer: các cột nội dung (hotline, địa chỉ, giờ làm việc...)
  - Theme: màu chủ đạo, màu gradient hero section, font chữ

Thay đổi cài đặt giao diện phản ánh ngay lên website của tenant mà không cần deploy lại.

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
npm run dev        # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`

### Seed dữ liệu mẫu

Trước khi chạy seed, cần **tạm thời mở quyền truy cập** để script seed có thể ghi dữ liệu mà không bị chặn bởi access control.

**Bước 1 — Mở quyền tạm thời (2 file)**

Trong `backend/src/collections/Pages/access/index.ts` và `backend/src/collections/Tenants/access/index.ts`, tìm dòng sau trong hàm `isTenantMember`:

```ts
// Trước
if (!req?.user) return false;

// Sửa thành
if (!req?.user) return true;
```

> Cần sửa ở **cả 2 file**: `Pages/access/index.ts` và `Tenants/access/index.ts`

**Bước 2 — Chạy seed**

```bash
npm run seed
```

**Bước 3 — Khôi phục lại (bắt buộc)**

Sau khi seed xong, **đổi lại thành `return false`** ở cả 2 file:

```ts
if (!req?.user) return false;
```

> Nếu không khôi phục, hệ thống sẽ cho phép request không xác thực tạo/sửa/xóa dữ liệu.

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

## API Testing (Postman)

File `Payload-Astro API.json` ở thư mục gốc là Postman Collection chứa toàn bộ các API của hệ thống, đã được cấu hình sẵn với mô tả chi tiết cho từng endpoint.

**Cách import:**

1. Mở Postman → **Import**
2. Chọn file `Payload-Astro API.json`
3. Đăng nhập bằng API **Auth / Login** → copy `token` từ response
4. Set biến Environment `token` = giá trị vừa copy
5. Tất cả request còn lại đã cấu hình `Authorization: JWT {{token}}` sẵn

Collection bao gồm 8 nhóm: **Auth**, **Tenants**, **Users**, **Pages**, **Tickets**, **Orders**, **Site Settings**, **Media**.

---

## Tech Stack

| | Công nghệ |
|---|---|
| Backend | Payload CMS 3.x, Next.js 15, TypeScript |
| Frontend | Astro 4, React 19, TypeScript |
| Database | PostgreSQL |
| File upload | Local (`publics/images/`) |
