import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { UserConfig } from 'vite';

import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

let server: UserConfig['server'] | undefined;

if (process.env.CI !== 'true') {
  const certDir = path.join(__dirname, '../server/dev-certs/');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    const packageRootPath = path.join(__dirname, '../..');
    const keyRelativePath = `.${keyPath.substring(packageRootPath.length)}`;
    const certRelativePath = `.${certPath.substring(packageRootPath.length)}`;

    throw new Error(
      `\n
      \nUnable to find development SSL keys where expected.\n
      \n${keyRelativePath}\n${certRelativePath}
      \nRun './scripts/trust-dev-cert.sh' to create them.\n`,
    );
  }

  server = {
    open: true,
    strictPort: true,
    https: {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    },
    proxy: {
      '/dev/api': {
        target: 'https://localhost:8081',
        secure: false,
        changeOrigin: true,
      },
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server,
  base: './',
  publicDir: './public',
  build: {
    minify: false,
    outDir: '../../build/client/',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        rollupNodePolyFill(),
      ],
    },
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
      '@': path.resolve(__dirname, './src'),
      // https://gist.github.com/FbN/0e651105937c8000f10fefdf9ec9af3d
      // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
      // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
      // process and buffer are excluded because already managed
      // by node-globals-polyfill
      //util: 'rollup-plugin-node-polyfills/polyfills/util',
      //sys: 'util',
      //events: 'rollup-plugin-node-polyfills/polyfills/events',
      //stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      //path: 'rollup-plugin-node-polyfills/polyfills/path',
      //querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
      //punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
      //url: 'rollup-plugin-node-polyfills/polyfills/url',
      //string_decoder:
      //    'rollup-plugin-node-polyfills/polyfills/string-decoder',
      //http: 'rollup-plugin-node-polyfills/polyfills/http',
      //https: 'rollup-plugin-node-polyfills/polyfills/http',
      //os: 'rollup-plugin-node-polyfills/polyfills/os',
      //assert: 'rollup-plugin-node-polyfills/polyfills/assert',
      //constants: 'rollup-plugin-node-polyfills/polyfills/constants',
      //_stream_duplex:
      //    'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
      //_stream_passthrough:
      //    'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
      //_stream_readable:
      //    'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
      //_stream_writable:
      //    'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
      //_stream_transform:
      //    'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
      //timers: 'rollup-plugin-node-polyfills/polyfills/timers',
      //console: 'rollup-plugin-node-polyfills/polyfills/console',
      //vm: 'rollup-plugin-node-polyfills/polyfills/vm',
      //zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
      //tty: 'rollup-plugin-node-polyfills/polyfills/tty',
      //domain: 'rollup-plugin-node-polyfills/polyfills/domain'
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        //envPlugin,
        //NodeGlobalsPolyfillPlugin({
        //    process: true,
        //    buffer: true
        //}),
        //NodeModulesPolyfillPlugin()
      ],
    },
    include: ['@emotion/styled'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/setupTests',
    restoreMocks: true,
  },
});
