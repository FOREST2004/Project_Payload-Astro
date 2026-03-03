const API_URL = import.meta.env.PAYLOAD_API_URL || "http://localhost:3000";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  public?: boolean;
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

export type SiteSettings = {
  id: string;
  logoText?: string;
  primaryColor?: string;
  navLinks?: { label: string; url: string }[];
  tenant: string | Tenant;
};

async function fetchPayload<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`Payload fetch error: ${res.status} ${path}`);
  return res.json();
}

// Tìm tenant theo domain hoặc slug
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
