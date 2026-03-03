import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Dùng cho URL path, vd: /funpark/...' },
    },
    {
      name: 'domain',
      type: 'text',
      index: true,
      admin: { description: 'Custom domain, vd: funpark.com', position: 'sidebar' },
    },
    {
      name: 'public',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Không cần đăng nhập để xem', position: 'sidebar' },
    },
  ],
}
