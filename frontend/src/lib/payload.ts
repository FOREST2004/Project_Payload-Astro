const API_URL = import.meta.env.PAYLOAD_API_URL;
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export type MediaFile = {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  public?: boolean;
  contact?: { phone?: string; email?: string; address?: string };
  images?: MediaFile[];
  storeSlug: string;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  tenant: string | Tenant;
};

export type Ticket = {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: "active" | "sold-out" | "paused";
  tenant: string | Tenant;
};

export type NavLink = { label: string; url: string };

export type Theme = {
  primaryColor: string;
  darkColor: string;
  heroBgFrom: string;
  heroBgTo: string;
  fontFamily: "segoe" | "inter" | "roboto" | "merriweather";
};

export type FooterColumn = {
  id?: string;
  title?: string;
  contentSource: "custom" | "tenant";
  tenantFieldPath?: string;
  content?: string;
};

export type SiteSettings = {
  id: string;
  header: {
    enabled: boolean;
    topBar: { enabled: boolean; leftText?: string; rightText?: string };
    logoText?: string;
    navLinks: NavLink[];
  };
  theme: Theme;
  footer: {
    enabled: boolean;
    copyrightText?: string;
    columns: FooterColumn[];
  };
  tenant: string | Tenant;
};

export type SimulateItem = {
  item: number;
  quantity: number;
  answers: unknown[];
  is_bundle: boolean;
  voucher?: string;
  isAddOn: boolean;
};

export const FONT_MAP: Record<string, string> = {
  segoe: "'Segoe UI', system-ui, sans-serif",
  inter: "'Inter', system-ui, sans-serif",
  roboto: "'Roboto', system-ui, sans-serif",
  merriweather: "'Merriweather', Georgia, serif",
};

// Lấy giá trị từ tenant theo path kiểu "contact.phone"
export function resolveTenantPath(tenant: Tenant, path: string): string {
  const keys = path.split(".");
  let val: any = tenant;
  for (const key of keys) val = val?.[key];
  return val ?? "";
}

async function fetchPayload<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`Payload fetch error: ${res.status} ${path}`);
  return res.json();
}

export async function getTenantByDomain(
  domain: string,
): Promise<Tenant | null> {
  try {
    const data = await fetchPayload<{ docs: Tenant[] }>(
      `/tenants?where[domain][equals]=${encodeURIComponent(domain)}&limit=1`,
    );
    return data.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const data = await fetchPayload<{ docs: Tenant[] }>(
      `/tenants?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    );
    return data.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPageBySlug(
  tenantId: string,
  slug: string,
): Promise<Page | null> {
  try {
    const data = await fetchPayload<{ docs: Page[] }>(
      `/pages?where[tenant][equals]=${tenantId}&where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    );
    return data.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getTickets(tenantId: string): Promise<Ticket[]> {
  try {
    const data = await fetchPayload<{ docs: Ticket[] }>(
      `/tickets?where[tenant][equals]=${tenantId}&where[status][equals]=active&limit=100`,
    );
    return data.docs;
  } catch {
    return [];
  }
}

export async function getSiteSettings(
  tenantId: string,
): Promise<SiteSettings | null> {
  try {
    const data = await fetchPayload<{ docs: SiteSettings[] }>(
      `/site-settings?where[tenant][equals]=${tenantId}&limit=1`,
    );
    return data.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getProducts(
  merchantSlug: string,
  storeSlug: string,
): Promise<Product[]> {
  if (!storeSlug || !merchantSlug) {
    return [];
  }

  const productsFilter = encodeURIComponent(
    JSON.stringify({
      where: { active: true, salesChannels: { inq: ["web"] } },
      offset: 0,
      limit: 200,
    }),
  );

  const productsUrl = `${API_BASE_URL}/merchants/${merchantSlug}/stores/${storeSlug}/products/search?filter=${productsFilter}&locale=en`;
  const productsRes = await (await fetch(productsUrl)).json();

  return productsRes?.data || [];
}

export type Voucher = {
  id: number;
  validUntil: string | null;
  code: string;
  priceMode: "percent" | "set" | "subtract";
  value: string;
  itemId: number | null;
  variationId: number | null;
  seatId: number | null;
};

export async function getVouchers(
  merchantSlug: string,
  storeSlug: string,
  code?: string,
): Promise<Voucher[]> {
  const filter = encodeURIComponent(
    JSON.stringify(code ? { where: { code } } : { offset: 0, limit: 100 }),
  );
  const url = `${API_BASE_URL}/merchants/${merchantSlug}/stores/${storeSlug}/vouchers/channels/web?filter=${filter}`;
  const res = await (await fetch(url)).json();
  return res?.data || [];
}

export type SimulateResponse = {
  total: string;
  fees: unknown[];
  positions: {
    id: number;
    item: number;
    price: string;
    voucher: number | null;
    discount: string | null;
  }[];
};

export async function postSimulate(
  merchantSlug: string,
  storeSlug: string,
  items: SimulateItem[],
): Promise<SimulateResponse | null> {
  const url = `${API_BASE_URL}/merchants/${merchantSlug}/stores/${storeSlug}/orders/simulate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, sales_channel: "web" }),
  });
  const data = await res.json();
  return data || {};
}

export async function makeOrder(
  merchantSlug: string,
  storeSlug: string,
  items: SimulateItem[],
  email: string,
  phone: string,
  recaptcha: string,
): Promise<any> {
  const url = `${API_BASE_URL}/merchants/${merchantSlug}/stores/${storeSlug}/orders/makeOrder`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      email,
      phone,
      comment: "",
      sales_channel: "web",
      invoice_address: {
        vat_id: "",
        company: "",
        street: "",
        name: "",
        name_parts: { full_name: "" },
        city: "",
        zipcode: "",
        country: "VN",
        is_business: false,
      },
      shipping_address: {
        attendee_name_parts: { full_name: "" },
        street: "",
        city: "",
        zipcode: "",
        country: "VN",
        company: "",
      },
      payment_provider: "vnpay",
      meta_info: { name: "" },
      recaptcha,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Gom field errors thành 1 string, ví dụ: {"phone": ["..."]}
    const messages = Object.values(data as Record<string, string[]>)
      .flat()
      .join(", ");
    throw new Error(messages || "Đặt hàng thất bại.");
  }
  return data || null;
}
