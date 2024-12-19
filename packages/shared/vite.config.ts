import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@shared': path.join(__dirname, '../shared/src/'),
      '@client': path.join(__dirname, '../client/src/'),
      '@server': path.join(__dirname, '../server/src/'),
      '@shared/*': path.join(__dirname, '../shared/src/*'),
      '@client/*': path.join(__dirname, '../client/src/*'),
      '@server/*': path.join(__dirname, '../server/src/*'),
    },
  },
  test: {
    restoreMocks: true,
    deps: {
      optimizer: {
        ssr: {
          enabled: false,
        },
      },
    },
  },
});
