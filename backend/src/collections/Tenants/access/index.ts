import type { Access } from "payload";

const getUserTenantIds = (user: any): string[] => {
  if (!user?.tenants?.length) return [];
  return user.tenants
    .map((t: any) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
    .filter(Boolean);
};

// Dùng cho update / delete
export const isTenantMember: Access = ({ req }) => {
  if (!req?.user) return false;
  if (req.user.roles?.includes("super-admin")) return true;

  const tenantIds = getUserTenantIds(req.user);
  if (!tenantIds.length) return false;

  return {
    id: { in: tenantIds },
  };
};

// Dùng cho create
export const filterByUserTenants = ({ user }: { user: any }) => {
  if (!user) return false;
  if (user?.roles?.includes("super-admin")) return true;

  const tenantIds = getUserTenantIds(user);
  if (!tenantIds.length) return false;

  return {
    id: { in: tenantIds },
  };
};
