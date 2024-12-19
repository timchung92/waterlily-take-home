import { defineConfig } from "vitest/config";
import { mkdirSync } from 'fs';
import path from 'path';
// import { join } from "path";

const outDir = path.join(__dirname, '../../build/server');
mkdirSync(outDir, { recursive: true });

export default defineConfig({
  plugins: [],
  base: './',
  build: {
    minify: false,
    outDir,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@shared': path.join(__dirname, "../shared/src/"),
      '@client': path.join(__dirname, '../client/src/'),
      '@server': path.join(__dirname, '../server/src/'),
      '@shared/*': path.join(__dirname, '../shared/src/*'),
      '@client/*': path.join(__dirname, '../client/src/*'),
      '@server/*': path.join(__dirname, '../server/src/*'),
    },
  },
  test: {
    environment: "jsdom",
    // setupFiles: "src/setupTests",
    restoreMocks: true,
  },
});
