import type { CollectionConfig } from 'payload'
import { isTenantMember, filterByUserTenants } from "../Pages/access";

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderCode',
  },
  access: {
    read: () => true,
    create: () => true,
    update: isTenantMember,
    delete: isTenantMember,
  },

  fields: [
    {
      name: 'orderCode',
      type: 'text',
      label: 'Mã đơn hàng',
      required: true,
      index: true,
      unique: true,
      admin: { readOnly: true },
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
    {
      name: 'buyerName',
      type: 'text',
      label: 'Tên người mua',
      required: true,
    },
    {
      name: 'buyerEmail',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'buyerPhone',
      type: 'text',
      label: 'Số điện thoại',
      required: true,
    },
    {
      name: 'ticket',
      type: 'relationship',
      label: 'Vé',
      relationTo: 'tickets',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Số lượng vé',
      required: true,
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'totalAmount',
      type: 'number',
      label: 'Tổng tiền (VNĐ)',
      required: true,
      min: 0,
    },
  ],
}
