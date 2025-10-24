# Astro GitHub Content Manager

An Astro integration that adds a simple, clean web interface to your project for uploading Markdown/MDX posts and images directly to your GitHub repository.

![Screenshot of the Content Manager UI](https://i.imgur.com/example.png) <!-- It's good practice to add a screenshot -->

## ✨ Key Features

- **Seamless Astro Integration:** Install as an npm package and add it to your `astro.config.mjs`.
- **Automatic Repository Detection:** The integration automatically knows which repository it's in. No setup needed.
- **Secure and Focused:** Works only with the repository it's installed in, preventing accidental changes to other projects.
- **Direct GitHub Uploads:** Connects securely to GitHub using a Fine-Grained Personal Access Token.
- **Dual Content Uploaders:** Separate, organized sections for uploading posts (`.md`, `.mdx`) and images.
- **Visual Directory Picker:** Navigate your repository's folder structure to select the correct upload path.
- **Image Snippet Generation:** Automatically get a Markdown-ready snippet for newly uploaded images.
- **Clean, Responsive UI:** Built with React and Tailwind CSS for a great experience on any device.

---

## 🚀 Getting Started

This tool is an [Astro Integration](https://docs.astro.build/en/guides/integrations-guide/).

### 1. Installation

```bash
npm install astro-github-content-manager
```

### 2. Configuration

In your `astro.config.mjs` file, import the integration and add it to the `integrations` array.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import contentManager from 'astro-github-content-manager';

export default defineConfig({
  integrations: [
    react(), // Required for the UI
    contentManager({ 
      // The route where the content manager will be available
      route: '/dashboard' 
    })
  ]
});
```

### 3. Generate a GitHub Token

Create a [GitHub Fine-Grained Personal Access Token](https://github.com/settings/tokens/new?type=beta).

- **Repository access:** Grant it access **only** to the specific repository you want to manage.
- **Permissions:** Under "Repository permissions," set **"Contents"** to **"Read and write"**.

Copy the generated token. You will need it to log in.

### 4. Use the Content Manager

1.  Start your Astro dev server: `npm run dev`.
2.  Navigate to the route you configured (e.g., `http://localhost:4321/dashboard`).
3.  Paste your token to connect to your GitHub repository.
4.  Select your destination directories and start uploading your content!

## 🛠️ Technology Stack

- **Framework:** Astro, React, TypeScript
- **Styling:** Tailwind CSS
- **API:** GitHub REST API
- **Backend Logic:** Node.js (via Astro integration)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for bugs, features, or suggestions.

## 📄 License

This project is licensed under the MIT License.