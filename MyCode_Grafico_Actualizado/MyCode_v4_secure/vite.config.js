import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(rootDir, 'index.html'),
        login: resolve(rootDir, 'login.html'),
        register: resolve(rootDir, 'register.html'),
        dashboard: resolve(rootDir, 'dashboard.html'),
        plans: resolve(rootDir, 'plans.html'),
        course: resolve(rootDir, 'course.html'),
        checkout: resolve(rootDir, 'checkout.html')
      }
    },
    modulePreload: true,
    sourcemap: true
  }
});
