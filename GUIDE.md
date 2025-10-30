# Astro Content Manager Guide

Hello, I'm your Astro developer. I'm happy to provide an overview of the Astro Content Manager's architecture and functionality. It's a very interesting and well-designed application!

### Application Overview

**Main Purpose:** "Astro Content Manager" is a client-side Web UI that allows you to manage content (Markdown/MDX posts and images) directly in your GitHub repository. It's especially useful for projects built with Astro.js. The goal is to simplify your workflow, helping you publish and update content without needing complex Git commands or a local development environment.

**Technology Stack:**
*   **Frontend Framework:** React and TypeScript.
*   **Styling:** Tailwind CSS for rapid and consistent UI development.
*   **API Interaction:** Uses the browser's native `fetch` API to call the GitHub REST API.
*   **External Libraries (via CDN):**
    *   `Marked` & `DOMPurify`: To render Markdown into HTML securely.
    *   `JSZip`: To create `.zip` archives for the backup feature.
*   **Special Feature:** This application requires no build step. It uses an `importmap` in `index.html` to load React modules directly, allowing you to run it immediately just by opening the `index.html` file in your browser.

### Workflow

Here's how the application works from start to finish:

1.  **Login & Connection:**
    *   The user accesses the app and sees the `GithubConnect` screen.
    *   They enter their Repository URL and a GitHub Fine-Grained Personal Access Token (PAT). This token needs **Read and write** permissions for the repository's **Contents**.

2.  **Authentication & Encryption:**
    *   The `App.tsx` component receives the token and URL, then calls `githubService` to validate the token and check repository permissions.
    *   If successful, the app performs a critical security step:
        *   It uses the Web Crypto API (in `utils/crypto.ts`) to create an encryption key (`CryptoKey`).
        *   The PAT is encrypted with this key.
        *   The encrypted token and the key are stored in the browser's `sessionStorage`. This is much more secure than storing the token as plain text.
    *   After saving, the app displays the main `Dashboard` interface.

3.  **First-Time Setup:**
    *   When first accessing a repository's Dashboard, the app automatically scans the repository (`githubService.scanForContentDirectories`) to find directories containing Markdown files (e.g., `src/content/blog`, `src/posts`).
    *   It suggests these directories for you to select as your posts directory. Your choice is saved in `localStorage` to streamline future visits. This is a smart feature that improves the user experience.

4.  **Content Management:**
    *   The user interacts with the tabs on the Dashboard. All actions (reading, creating, editing, deleting files) are translated into corresponding API calls to GitHub by `githubService`.
    *   For example, when you upload a file, `githubService` converts it to Base64 format and sends it to GitHub via a `PUT` request. Each action creates a new commit in the repository.

5.  **Session End:**
    *   When the user clicks "Log Out" or closes the browser tab, `sessionStorage` is automatically cleared, removing the encrypted token and key, ensuring security.

### Code Structure and Key File Roles

*   **index.html**: The root HTML file and the starting point. It loads CSS, JS libraries from CDNs, and the `index.tsx` file to launch the React application.
*   **App.tsx**: The root component of the entire application.
    *   Manages login state (token, user info, selected repo).
    *   Controls the authentication, encryption, and session storage flow.
    *   Decides whether to display the login screen (`GithubConnect`) or the management interface (`Dashboard`).
*   **services/githubService.ts**: The "heart" of the interaction with the GitHub API.
    *   This is an abstraction layer for all GitHub API calls.
    *   Contains functions like `getRepoContents`, `uploadFile`, `deleteFile`, etc.
    *   Handles Base64 encoding/decoding for file content, as required by the GitHub API.
*   **utils/**: Directory containing utility functions.
    *   **crypto.ts**: Contains the client-side encryption and decryption logic for the PAT, a major security feature.
    *   **parsing.ts**: Very important, contains functions to:
        *   `parseMarkdown`: Separate metadata (frontmatter) and the main content (body) from a Markdown file. It's smart enough to recognize common keys for cover images like `image`, `thumbnail`, and `cover`.
        *   `updateFrontmatter`: Automatically update the frontmatter.
        *   `slugify`: Convert a post title into a URL-friendly string.
*   **components/**: Directory containing all React components.
    *   **Dashboard.tsx**: The main component after login, containing functional tabs.
    *   **PostList.tsx**: Displays the list of posts as cards, with search, pagination, and action buttons (edit, delete, preview).
    *   **NewPostCreator.tsx**: A step-by-step interface for creating a new post. It includes a feature to validate frontmatter against a template for consistency.
    *   **ImageList.tsx**: Displays a list of images from the assets directory, allowing for search, preview, URL copying, and deletion.
    *   **TemplateGenerator.tsx**: An advanced feature that lets you create a standard frontmatter template by uploading an existing post. New posts will then be required to follow this template.
    *   **BackupManager.tsx**: Provides functionality to download a `.zip` backup of the posts or images directories.
    *   **DirectoryPicker.tsx**: An intuitive modal that helps users browse the repository's folder structure and select a directory.
*   **i18n/**: Directory for managing internationalization.
    *   **translations.ts**: Contains all text strings for both English and Vietnamese. This is the single source for adding or modifying UI text.
    *   **I18nContext.tsx**: Creates a React Context to provide the translation function (`t`) and the current language state to the entire app. The `LanguageSwitcher` component also uses this context to change the language.

### Internationalization (i18n) System

The application fully supports English and Vietnamese. The logic is managed in the `i18n/` directory. When you need to add new text, add a key and its corresponding value for both languages in the `translations.ts` file, then call the `t('your.key')` function from the `useI18n()` hook in your component. The selected language is saved in `localStorage` to persist across sessions.

### Updating the Application

Because this is a completely client-side application that requires no build step, updating to the latest version is very simple.
If you have cloned the project from GitHub, just navigate to the project directory on your computer and run the following command to get the latest updates from the `main` branch:
```bash
git pull origin main
```
After that, simply reload the `index.html` file in your browser, and you will be using the newest version!