import type { Access } from "payload";

const getUserTenantIds = (user: any): string[] => {
  console.log("user (isTenantMember):::", JSON.stringify(user, null, 2));
  if (!user?.tenants?.length) return [];
  return user.tenants
    .map((t: any) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
    .filter(Boolean); //filter lọc ra các giá trị falsy, lọc bỏ các giá trị falsy, chỉ lấy các giá trị truthy
};

// Dùng cho update / delete
export const isTenantMember: Access = ({ req }) => {
  if (!req?.user) return true;
  if (req.user.roles?.includes("super-admin")) return true;

  const tenantIds = getUserTenantIds(req.user);
  if (!tenantIds.length) return false;

  return {
    id: { in: tenantIds },
  };
};

// Dùng cho create
export const filterByUserTenants = ({ user }: { user: any }) => {
  if (user?.roles?.includes("super-admin")) return true;

  const tenantIds = getUserTenantIds(user);
  if (!tenantIds.length) return false;

  return {
    id: { in: tenantIds },
  };
};
