import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.tsx', // Your entry file
      name: 'EmailTemplateBuilder', // Global variable name for the outer app
      fileName: (format) => `my-react-app.${format}.js`,
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
        // moduleSideEffects: (id, _external) => {
        //   return !id.includes('/editor-sample/');
        // },
      },
    },
  },
});
