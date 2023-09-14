// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['*.ts'],
    include :['vitests/*.{ts,js}'],
    cache :  {dir:"./vitests/"}
  },
})