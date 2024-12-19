import { defineConfig } from 'vitest/config';
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
      '@shared': path.join(__dirname, './packages/shared/src/'),
      '@client': path.join(__dirname, './packages/client/src/'),
      '@server': path.join(__dirname, './packages/server/src/'),
      '@shared/*': path.join(__dirname, './packages/shared/src/*'),
      '@client/*': path.join(__dirname, './packages/client/src/*'),
      '@server/*': path.join(__dirname, './packages/server/src/*'),
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
