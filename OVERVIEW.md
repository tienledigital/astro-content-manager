# Project Overview: Astro Content Manager

This document provides a detailed overview of the Astro Content Manager, including its functionality, technical stack, and setup instructions.

## 1. Introduction

The Astro Content Manager is a client-side web application designed to simplify the process of adding new content (Markdown/MDX blog posts and images) to an Astro-based project hosted on GitHub. It provides a user-friendly interface that communicates directly with the GitHub API, eliminating the need for `git` commands or local development environments for simple content additions.

The entire application runs in the browser. User credentials (GitHub PAT) are stored securely in `sessionStorage` for the current browser session and are only sent directly to the GitHub API.

## 2. Core Functionality

### GitHub Authentication
- The application uses a GitHub **Personal Access Token (PAT)** for authentication.
- For maximum security, users must generate a **Fine-Grained Personal Access Token**. This allows access to be restricted to a single repository with specific permissions.
- The required permissions are under "Repository permissions": **"Contents"** must be set to **"Read and write"**.
- The token is saved in the browser's `sessionStorage` for the current session, providing better security. It is cleared when the browser tab is closed.

### Repository Selection
- Once authenticated, the application fetches a list of all repositories the user has access to.
- A search bar is provided to quickly filter and find the target Astro repository.
- The selected repository is also saved in `sessionStorage` to streamline the user's workflow within the same session.

### Content Uploading
The main interface is split into two sections:

#### **Post Uploader**
- Designed for uploading Markdown (`.md`) and MDX (`.mdx`) files.
- Users can select a destination directory within the repository using a visual **Directory Picker**. This prevents typos and ensures files land in the correct location (e.g., `src/content/blog/`).
- The allowed file types are configured within the project to be **`.md` and `.mdx`**.

#### **Image Uploader**
- Designed for uploading common image formats.
- Similar to the post uploader, it features a **Directory Picker** to select the target folder (e.g., `public/images/`).
- The allowed file types are configured as **`image/*`**, accepting most standard image formats.
- After a successful image upload, the application generates and displays a ready-to-use Markdown snippet (e.g., `![alt text](/images/my-image.png)`) for easy copying and pasting into a post.

## 3. How It Works: The Workflow

1.  **Connect:** The user provides their GitHub PAT.
2.  **Verify & Fetch:** The app sends a request to the GitHub API (`/user`) to verify the token. On success, it fetches the user's repositories.
3.  **Select Repo:** The user selects a repository from the list.
4.  **Set Paths:** The user navigates the repository filesystem using the Directory Picker modals to set the target paths for posts and images. By default, the path is the repository root (`/`).
5.  **Choose File:** The user selects a local file to upload.
6.  **Encode & Upload:** The application reads the file, converts it to a Base64 encoded string, and sends it to the GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`).
7.  **Commit:** This API call creates a new commit in the repository with the uploaded file. The commit message is automatically generated (e.g., `feat: add 'my-post.md' via Astro Content Manager`).
8.  **Feedback:** The UI provides success or error messages to inform the user of the outcome.

## 4. Technical Stack

- **Framework:** **React 19** with TypeScript
- **Styling:** **Tailwind CSS** for rapid, utility-first styling.
- **API Interaction:** Native `fetch` API to interact with the **GitHub REST API**.
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`).
- **No Build Step:** The project uses `ESM` modules via an import map in `index.html`, allowing it to run directly in modern browsers without a complex build process.

## 5. Project Structure

```
.
├── components/          # React components
│   ├── icons/           # SVG icon components
│   ├── ContentUploader.tsx
│   ├── DirectoryPicker.tsx
│   ├── FileUploader.tsx
│   ├── GithubConnect.tsx
│   └── RepoSelector.tsx
├── services/            # API interaction logic
│   └── githubService.ts
├── App.tsx              # Main application component
├── index.html           # Entry point, includes Tailwind CSS and import map
├── index.tsx            # Renders the React application
├── types.ts             # TypeScript type definitions
└── README.md            # You are here
```

## 6. Setup and Installation

As a purely client-side application, there is no server-side setup required.

1.  **Prerequisites:** A modern web browser.
2.  **Running the App:**
    - Clone or download the project files.
    - You can open `index.html` directly in your browser. However, for full functionality, it's recommended to serve the files using a simple local web server to avoid potential issues with browser security policies.
    - An easy way to do this is using the `http.server` module in Python or the `live-server` package from npm:
      ```bash
      # Using Python
      python -m http.server

      # Or using npm's live-server
      npx live-server
      ```
3.  **Generate a GitHub Fine-Grained Token:** Go to your [GitHub Developer Settings](https://github.com/settings/tokens/new?type=beta) and generate a new "Fine-Grained" token. During setup, select the specific repository you want this tool to manage and grant it **Repository Permissions** for **"Contents"** with **"Read and write"** access. Copy this token.
4.  **Use the App:** Open the running application in your browser and paste the token when prompted. You are now ready to manage your content.