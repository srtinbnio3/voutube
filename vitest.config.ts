/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'https://duonczcxutysrftgpoca.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b25jemN4dXR5c3JmdGdwb2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODMzMTMsImV4cCI6MjA1Njg1OTMxM30.oLnGAQWlYHR-BuA6HZ3JSJzHO669AJraRe4rkJQlpvE'
    },
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
}) 