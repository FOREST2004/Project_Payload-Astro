import { defineMiddleware } from "astro:middleware";
import { getTenantByDomain, getTenantBySlug } from "./lib/payload";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  let tenant = null;

  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    tenant = await getTenantByDomain(hostname);
  } else {
    console.log("Skipping domain lookup for localhost");
  }

  // Fallback: dùng query param ?tenant=slug (để dev dễ test)
  if (!tenant) {
    const slugParam = url.searchParams.get("tenant");
    if (slugParam) {
      tenant = await getTenantBySlug(slugParam);
    }
  }

  // Fallback cuối: lấy tenant đầu tiên có public=true
  if (!tenant) {
    try {
      const API_URL =
        import.meta.env.PAYLOAD_API_URL;
      const res = await fetch(
        `${API_URL}/api/tenants?where[public][equals]=true&limit=1`,
      );
      if (res.ok) {
        const data = await res.json();
        tenant = data.docs[0] ?? null;
      }
    } catch {
      // ignore
    }
  }

  locals.tenant = tenant;
  return next();
});
