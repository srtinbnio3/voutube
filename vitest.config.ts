/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      'app/(auth-pages)/**/*.test.{js,jsx,ts,tsx}',     // 認証関連のテストを除外
    ],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      NODE_ENV: 'test'
    },
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
}) 