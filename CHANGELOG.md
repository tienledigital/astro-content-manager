# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.2] - 2024-05-27

### Added
- **Multi-language Support:** The entire UI now supports English (en) and Vietnamese (vi), with language selection saved locally.
- **Image Compression:** Added settings to enable automatic image compression and set a maximum file size limit for uploads.
- **Image Manager:** A new "Manage Images" tab in the dashboard to list, search, preview, and delete images from the assets directory.

### Changed
- **Improved Setup Wizard:** The initial setup process has been significantly improved. It now automatically scans for and suggests both post and image directories, and pre-selects the best guess to streamline the configuration process for the user.
- **Flexible Logout Flow:** The logout functionality has been redesigned. It now presents a confirmation dialog with an option to **also reset all saved settings**, providing a clear and flexible way for users to log out or start fresh.

### Fixed
- Corrected an issue where an incorrect image URL was generated when the `imagesPath` was set directly to 'public', ensuring proper resolution of cover images in the post list.

## [1.3.1] - 2024-05-26

### Changed
- **UI/UX Revamp:** Redesigned the login interface for a cleaner, more modern aesthetic inspired by Clerk. The new design features a centered card on a subtle background pattern.

## [1.3.0] - 2024-05-25

### Added
- **In-App Guide:** A new "Guide" button in the main menu opens a modal with a detailed overview of the application's features, workflow, and architecture.

### Changed
- **UI/UX Enhancements:**
  - Renamed the "Template" tab to "Post Template" for improved clarity.
  - Redesigned the "Post Template" page to be more intuitive. It now persistently displays the active template and offers "Download Sample File" and "Use Default Template" actions.
  - The main navigation menu is now sticky on desktop views for easier access while scrolling.

### Fixed
- **Mobile Navigation:** Resolved an overflow issue where the main navigation menu would exceed the screen width on smaller devices by enabling horizontal scrolling.

## [1.2.0] - 2024-05-22

### Security
- Implemented client-side encryption for the GitHub Personal Access Token using the Web Crypto API before storing it in `sessionStorage`. This enhances security by preventing the token from being stored in plaintext.

### Changed
- Updated the footer link on the login page to point directly to the project's source code on GitHub.

## [1.1.0] - 2024-05-21

### Added
- `CHANGELOG.md` to track project updates, new features, and versioning history.

## [1.0.0] - 2024-05-20

### Added
- **Initial Release:** First version of the Astro Content Manager.
- **GitHub Authentication:** Securely connect to GitHub using a Fine-Grained Personal Access Token.
- **Repository Selection:** A list of repositories with a search filter to easily select your Astro project.
- **Content Uploading:** Separate uploaders for posts (`.md`, `.mdx`) and images.
- **Directory Picker:** A visual modal to navigate your repository's folder structure and select upload destinations.
- **Image Snippet Generation:** Automatically provides a Markdown-ready snippet for uploaded images.
- **Session Persistence:** Remembers your token and selected repository for the duration of the browser session.
- **Responsive UI:** A clean and modern interface built with React and Tailwind CSS.