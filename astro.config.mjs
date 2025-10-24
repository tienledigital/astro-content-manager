import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// Import the content manager integration from its new location
import contentManager from './src/lib/content-manager/integration'; // <-- Đường dẫn có thể thay đổi

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    // Add the content manager integration
    // You can customize the route where the manager will be available
    contentManager({ route: '/admin' }) // Ví dụ: truy cập qua a.com/admin
  ]
});