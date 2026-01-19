import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
    browser: {
      enabled: false, // Enable with --browser flag
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
  },
});
