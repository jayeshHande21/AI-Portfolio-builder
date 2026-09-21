import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { sectionAiPlugin } from './server/vite-plugin-section-ai'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sectionAiPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
})
