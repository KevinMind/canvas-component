import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    browser: {
      enabled: false, // Enable with --browser flag
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
  },
});
