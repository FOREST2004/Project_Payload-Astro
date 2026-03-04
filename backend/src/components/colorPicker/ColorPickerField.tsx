'use client'
import { useField, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const ColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value = '#000000', setValue } = useField<string>({ path })

  return (
    <div className="field-type text">
      <FieldLabel label={field.label} required={field.required} />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          title="Color picker"
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: 40, height: 36, padding: 2, cursor: 'pointer', border: '1px solid #333' }}
        />
        <input
          className="color-picker-text-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#000000"
          style={{ flex: 1, padding: '4px 8px', background: '#1b1b1b', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
        />
      </div>
    </div>
  )
}
