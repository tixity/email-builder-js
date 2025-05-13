import path from 'path';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // react: path.resolve(__dirname, 'node_modules/react'),
      // 'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@usewaypoint/email-builder': path.resolve(__dirname, './email-builder/src'),
    },
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'EmailTemplateBuilder',
      fileName: (format) => `email-template-builder.${format}.js`,
      formats: ['umd'],
    },
    // sourcemap: true,
    // minify: false,
    rollupOptions: {
      // only externalize if we ever have other micro frontends
      // external: ['react', 'react-dom'],
      // output: {
      //   globals: {
      //     react: 'React',
      //     'react-dom': 'ReactDOM',
      //   },
      // },

      treeshake: {
        moduleSideEffects: (id) => {
          return !id.includes('/editor-sample/src/App/TemplatePanel/');
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@usewaypoint/email-builder', '@usewaypoint/block-templates'],
  },
});
