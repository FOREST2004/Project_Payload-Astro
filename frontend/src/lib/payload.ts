const API_URL = import.meta.env.PAYLOAD_API_URL;

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  public?: boolean;
  contact?: { phone?: string; email?: string; address?: string };
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
