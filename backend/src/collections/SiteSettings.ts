import type { CollectionConfig } from 'payload'

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'tenant',
    description: 'Cấu hình giao diện cho từng tenant',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'logoText',
      type: 'text',
      label: 'Logo text (để trống = tên tenant)',
    },
    {
      name: 'primaryColor',
      type: 'text',
      label: 'Màu chính (hex)',
      defaultValue: '#3b82f6',
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Navigation links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Tên hiển thị',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Đường dẫn',
        },
      ],
    },
  ],
}
