import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  output: 'static',
  integrations: [react()],
  server: { port: 4321, host: true },
  vite: {
    server: {
      allowedHosts: ['vinwonders.local', 'phuongtrang.local', 'localhost'],
    },
  },
})
