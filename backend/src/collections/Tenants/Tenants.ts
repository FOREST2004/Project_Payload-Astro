import type { CollectionConfig } from "payload";
// import { isSuperAdmin } from '../../access/isSupperAdmin'
import { isTenantMember } from "./access";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: { useAsTitle: "name" },
  access: {
    read: () => true,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
      admin: { description: "Dùng cho URL path, vd: /funpark/..." },
    },
    {
      name: "domain",
      type: "text",
      index: true,
      admin: {
        description: "Custom domain, vd: funpark.com",
        position: "sidebar",
      },
    },
    {
      name: "public",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: { description: "Không cần đăng nhập để xem", position: "sidebar" },
    },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "phone", type: "text" },
        { name: "email", type: "text" },
        { name: "address", type: "textarea" },
      ],
    },
    {
      name: "images",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
      label: "Ảnh quảng cáo",
    },
    {
      name: "storeSlug",
      type: "text",
      required: true,
      index: true,
      admin: { description: "Giả sử có field store slug để làm đối với trường hợp gọi API qua Admin Nexbus. Ví dụ đối với dam-sen là: ve-vao-cua", position: "sidebar" },
    }
  ],
};
