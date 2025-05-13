import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'EmailTemplateBuilder',
      fileName: (format) => `email-template-builder.${format}.js`,
      formats: ['umd'],
    },
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
        moduleSideEffects: (id, _external) => {
          return !id.includes('/editor-sample/src/App/TemplatePanel/');
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@usewaypoint/email-builder', '@usewaypoint/block-html'],
  },
});
