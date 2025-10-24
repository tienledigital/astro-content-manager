import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import contentManager from './integration';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    // Đây là cách người dùng sẽ tích hợp công cụ quản lý nội dung
    contentManager({ route: '/dashboard' })
  ]
});