import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      exclude: [
        'node_modules/**',
        '.next/**',
        'vitest.config.ts',
        'vitest.setup.ts',
        'scripts/**',
        'next.config.ts',
        'postcss.config.mjs',
        'eslint.config.mjs',
      ],
    },
  },
})
