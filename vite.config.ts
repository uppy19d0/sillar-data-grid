import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { assetFileNames: (assetInfo) => assetInfo.names?.some((name) => name.endsWith('.css')) ? 'styles.css' : 'assets/[name][extname]' },
    },
    sourcemap: true,
  },
});
