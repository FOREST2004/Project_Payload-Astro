import type { CollectionConfig } from 'payload'
// import { isSuperAdmin } from '../../access/isSupperAdmin'
import { isTenantMember, filterByUserTenants } from '../Pages/access'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên vé',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Giá (VNĐ)',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      label: 'Trạng thái',
      options: [
        { label: 'Đang bán', value: 'active' },
        { label: 'Hết vé', value: 'sold-out' },
        { label: 'Tạm dừng', value: 'paused' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
      filterOptions: filterByUserTenants,
    },
  ],
}
