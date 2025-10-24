import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// Import the content manager integration (this project's own integration)
import contentManager from './integration.ts'; // Correct path to the integration file

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    // Add this project's own content manager integration for development/testing
    // The route can be customized here for local development
    contentManager({ route: '/dashboard' }) // Default route for the integration's UI
  ]
});