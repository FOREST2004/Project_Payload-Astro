import type { CollectionConfig } from "payload";
// import { isSuperAdmin } from '../../access/isSupperAdmin'
import { isTenantMember, filterByUserTenants } from "../Pages/access";

export const SiteSettings: CollectionConfig = {
  slug: "site-settings",
  admin: {
    useAsTitle: "tenant",
    description: "Cấu hình giao diện cho từng tenant",
  },
  access: {
    read: isTenantMember,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
  },
  fields: [
    {
      name: "header",
      type: "group",
      label: "Header",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Hiển thị header",
          defaultValue: true,
        },
        {
          name: "topBar",
          type: "group",
          label: "Top Bar (thanh nhỏ phía trên)",
          admin: {
            condition: (data) => data?.header?.enabled,
          },
          fields: [
            {
              name: "enabled",
              type: "checkbox",
              label: "Hiển thị top bar",
              defaultValue: false,
            },
            {
              name: "leftText",
              type: "text",
              label: "Text bên trái",
              admin: { condition: (data) => data?.header?.topBar?.enabled },
            },
            {
              name: "rightText",
              type: "text",
              label: "Text bên phải",
              admin: { condition: (data) => data?.header?.topBar?.enabled },
            },
          ],
        },
        {
          name: "logoText",
          type: "text",
          label: "Logo text (để trống = dùng tên tenant)",
          admin: {
            condition: (data) => data?.header?.enabled,
          },
        },
        {
          name: "navLinks",
          type: "array",
          label: "Các link trong navigation",
          admin: {
            condition: (data) => data?.header?.enabled,
          },
          fields: [
            {
              name: "label",
              type: "text",
              label: "Tên hiển thị",
              required: true,
            },
            {
              name: "url",
              type: "text",
              label: "Đường dẫn (vd: /funpark/tickets)",
              required: true,
            },
          ],
        },
      ],
    },

    {
      name: "footer",
      type: "group",
      label: "Footer",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Hiển thị footer",
          defaultValue: true,
        },
        {
          name: "copyrightText",
          type: "text",
          label: "Dòng bản quyền (để trống = tự động)",
          admin: {
            condition: (data) => data?.footer?.enabled,
          },
        },
        {
          name: "columns",
          type: "array",
          label: "Cột nội dung footer",
          admin: {
            condition: (data) => data?.footer?.enabled,
          },
          fields: [
            {
              name: "title",
              type: "text",
              label: "Tiêu đề cột",
            },

            // chọn nguồn
            {
              name: "contentSource",
              type: "radio",
              label: "Nguồn nội dung",
              defaultValue: "custom",
              options: [
                { label: "Tự nhập", value: "custom" },
                { label: "Lấy từ Tenant", value: "tenant" },
              ],
            },

            // chọn field của tenant (lưu path)
            {
              name: "tenantFieldPath",
              type: "select",
              label: "Chọn dữ liệu từ Tenant",
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.contentSource === "tenant",
              },
              options: [
                { label: "Số điện thoại", value: "contact.phone" },
                { label: "Email", value: "contact.email" },
                { label: "Địa chỉ", value: "contact.address" },
              ],
            },

            // gõ tay (chỉ hiện khi custom)
            {
              name: "content",
              type: "textarea",
              label: "Nội dung (mỗi dòng là một mục)",
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.contentSource !== "tenant",
              },
            },
          ],
        },
      ],
    },

    {
      name: "theme",
      type: "group",
      label: "Theme & Màu sắc",
      fields: [
        {
          name: "primaryColor",
          type: "text",
          label: "Màu chính (hex, vd: #e84118)",
          defaultValue: "#e84118",
          admin: {
            description: "Dùng cho header, nút bấm, giá vé",
            components: {
              Field: '@/components/colorPicker/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: "darkColor",
          type: "text",
          label: "Màu nền tối (hex, vd: #1a1a2e)",
          defaultValue: "#1a1a2e",
          admin: {
            description: "Dùng cho footer, header trang vé",
            components: {
              Field: '@/components/colorPicker/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: "heroBgFrom",
          type: "text",
          label: "Hero gradient — màu bắt đầu (hex)",
          defaultValue: "#e84118",
          admin: {
            components: {
              Field: '@/components/colorPicker/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: "heroBgTo",
          type: "text",
          label: "Hero gradient — màu kết thúc (hex)",
          defaultValue: "#ffb347",
          admin: {
            components: {
              Field: '@/components/colorPicker/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: "fontFamily",
          type: "select",
          label: "Font chữ",
          defaultValue: "segoe",
          options: [
            { label: "Segoe UI (mặc định)", value: "segoe" },
            { label: "Inter", value: "inter" },
            { label: "Roboto", value: "roboto" },
            { label: "Merriweather (serif)", value: "merriweather" },
          ],
        },
      ],
    },

    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
      admin: { position: "sidebar" },
      filterOptions: filterByUserTenants,
    },

    // {
    //   name: "navLinks",
    //   type: "array",
    //   label: "Navigation links",
    //   fields: [
    //     {
    //       name: "label",
    //       type: "text",
    //       required: true,
    //       label: "Tên hiển thị",
    //     },
    //     {
    //       name: "url",
    //       type: "text",
    //       required: true,
    //       label: "Đường dẫn",
    //     },
    //   ],
    // },
  ],
};
