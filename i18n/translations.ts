
export const translations = {
  en: {
    app: {
      logout: 'Log Out',
      error: {
        unknown: 'An unknown error occurred.',
        invalidRepoUrl: 'Invalid GitHub repository URL. Please check and try again.',
        noWritePermissions: 'You do not have write permissions for this repository.',
        loginFailed: 'Login failed: {{message}}',
      }
    },
    githubConnect: {
      title: 'Astro Content Manager',
      subtitle: 'Connect to your GitHub repository to start managing content.',
      repoUrlLabel: 'Repository URL',
      repoUrlPlaceholder: 'https://github.com/owner/repo-name',
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'github_pat_...',
      tokenHelp: {
        p1: 'Create a ',
        link: 'Fine-Grained Token',
        p2: ' with ',
        b: '"Contents"',
        p3: ' read & write access for this repository only.',
      },
      connecting: 'Connecting...',
      connectButton: 'Connect to Repository',
      tokenDisclaimer: 'Your token is encrypted and stored only for this browser session.',
    },
    dashboard: {
      header: {
        title: 'Managing Repository:',
        subtitle: "An overview of your repository's content.",
      },
      stats: {
        posts: 'Total Posts',
        images: 'Total Images',
        lastUpdated: 'Last Updated',
        status: 'Status',
        connected: 'Connected',
      },
      nav: {
        manage: 'Manage Posts',
        create: 'Create Post',
        template: 'Post Template',
        backup: 'Backup',
        settings: 'Settings',
        guide: 'Guide',
        menuTitle: 'Menu',
      },
      setup: {
        title: 'Initial Setup Required',
        scanning: 'Scanning repository for content directories...',
        suggestionsTitle: 'Suggested Directories',
        suggestionsDesc: 'We found these directories containing markdown files. Select one to get started.',
        suggestionsDefaultDesc: "We couldn't find any content folders, but a common 'src/data/post' directory exists. You can select it to get started.",
        noSuggestions: "Could not automatically find a posts directory. Please select the directory where your blog posts (`.md`/`.mdx` files) are stored.",
        manualOption: 'Or, select a different directory manually.',
        manualButton: 'Select Directory Manually',
        saveNote: 'This setting will be saved for this repository in your browser.',
      },
      settings: {
        directories: {
          title: 'Directory Settings',
          postsLabel: 'Posts Directory',
          imagesLabel: 'Images Directory',
          notSelected: 'Not selected',
          changeButton: 'Change',
        },
        creation: {
            title: 'Post Creation Settings',
            publishDateLabel: 'Post Publish Date',
            dateFromFile: 'Use date from file (default)',
            dateFromSystem: 'Use current system date',
            publishDateHelp: "Determines the `publishDate` in a new post's frontmatter upon upload.",
        },
        commits: {
          title: 'Commit Message Templates',
          newPostLabel: 'New Post',
          updatePostLabel: 'Update Post',
          newImageLabel: 'New Image',
          updateImageLabel: "Update Post's Image",
          help: "You can use `{filename}` as a placeholder in your templates.",
        },
        fileTypes: {
          title: 'File Type Settings',
          postLabel: 'Post File Types',
          postHelp: 'Comma-separated list of extensions or MIME types.',
          imageLabel: 'Image File Types',
          imageHelp: 'Example: `image/*` for all image types.',
        },
      },
      footer: {
        sponsoredBy: 'Sponsored by',
      }
    },
    directoryPicker: {
        title: 'Select a Directory',
        currentPath: 'Current Path:',
        goUp: 'Go Up',
        cancel: 'Cancel',
        select: 'Select this Directory',
        error: 'Failed to fetch directory contents. The path might not exist.',
    },
    postList: {
        loading: 'Loading posts...',
        error: {
            dirNotFound: 'Directory not found: \'{{path}}\'. Please make sure this directory exists in your repository. You can change the target directory from the Settings tab.',
        },
        noPosts: 'No posts found in the selected directory.',
        searchPlaceholder: 'Search by title, author, category, tag...',
        noResults: 'No results found for your search.',
        updateImage: 'Update image',
        updateFile: 'Update file',
        by: 'by',
        category: 'Category',
        tags: 'Tags',
        more: '+{{count}} more',
        pagination: {
            prev: 'Previous',
            pageInfo: 'Page {{current}} of {{total}}',
            next: 'Next',
        },
        deleteConfirm: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
    },
    postPreview: {
        tabMetadata: 'Metadata',
        tabPreview: 'Preview',
        tabMarkdown: 'Markdown',
        delete: 'Delete',
    },
    newPost: {
        step1Title: 'Step 1: Upload Images (Optional)',
        step1Desc: 'If your post uses new images, upload them here first.',
        imageSelect: 'Select Image Files',
        imageSelectDesc: 'You can select multiple images at once.',
        imagePreviews: 'Image Previews:',
        step2Title: 'Step 2: Upload Post File',
        step2Desc: "Upload your completed markdown file. We'll validate its frontmatter before publishing.",
        validationInfo: {
            custom: 'Validation is using your <strong>custom template</strong>. Go to the "Post Template" tab to modify it.',
            default: 'Using <strong>default validation rules</strong>. You can set a custom template in the "Post Template" tab for stricter validation.',
        },
        postSelect: 'Select Post File',
        postSelectDesc: 'Allowed types: .md, .mdx',
        processing: 'Processing file...',
        validationErrorTitle: 'Validation Error:',
        validationSuccess: '✅ Validation successful! The file will be published as provided.',
        validationErrors: {
            missingField: "- Missing required field from template: '{{field}}'.",
            mustBeArray: "- Field '{{field}}' must be an array.",
            mustBeDate: "- Field '{{field}}' must be a valid date.",
            mustBeObject: "- Field '{{field}}' must be an object.",
            mustBeString: "- Field '{{field}}' must be a string.",
            missingDefaultField: "- Missing or empty required field: '{{field}}'.",
            missingPublishDate: "- Missing required field: 'publishDate'.",
            invalidPublishDate: "- Field 'publishDate' must be a valid date.",
            missingTags: "- Field 'tags' must be a non-empty array.",
            missingImage: "- When uploading images, the 'image' field in the frontmatter is required and must not be empty.",
            fileReadError: 'Error: Could not read the file.',
            parseError: 'Failed to process markdown file.',
            validationFailIntro: 'Please fix the following issues in your file:',
        },
        progress: {
            title: 'Progress',
            step1: 'Upload Images',
            step1Desc: 'Add new images for your post.',
            step2: 'Upload & Validate Post',
            step2Desc: 'Your markdown file must be valid.',
            step3: 'Publish',
            step3Desc: 'Commit files to your repository.',
        },
        howItWorks: {
            title: 'How it Works',
            li1: 'Upload any new images your post needs.',
            li2: 'Upload your final `.md` or `.mdx` file.',
            li3: "We'll validate the file's frontmatter.",
            li4: 'Click "Publish" to commit everything.',
        },
        publishButton: 'Publish Post',
        publishing: 'Publishing...',
        publishSuccess: 'Successfully published "{{filename}}"',
        publishError: 'A valid markdown file is required to publish.',
    },
    templateGenerator: {
        title: 'Post Frontmatter Template',
        description: 'Create a validation template by uploading an existing post. The "Create Post" feature will use this template to ensure new posts have the correct structure.',
        info: 'If no template is set, the "Create Post" feature will use default, less strict validation rules. Setting a template is highly recommended for consistency.',
        uploadTitle: 'Upload a post file to generate a custom template',
        uploadDesc: '.md or .mdx',
        processing: 'Processing...',
        error: {
            noFrontmatter: 'No frontmatter found in the uploaded file.',
            parse: 'Failed to parse file.',
            read: 'Could not read the file.'
        },
        previewTitle: 'Generated Template Preview',
        saveButton: 'Save as Active Template',
        activeTitle: 'Current Active Template',
        defaultTitle: 'Default Template (Active)',
        downloadButton: 'Download Sample File',
        useDefaultButton: 'Use Default Template',
        success: {
            saved: 'Template saved successfully!',
            default: 'Default template is now active!',
        },
        table: {
            field: 'Field Name',
            type: 'Expected Type',
        }
    },
    backupManager: {
        posts: {
            title: 'Backup Posts',
            description: 'Create a .zip archive of all markdown files from your content directory: {{path}}',
            button: 'Backup All Posts',
            zipping: 'Zipping posts...',
        },
        images: {
            title: 'Backup Images',
            description: 'Create a .zip archive of all files from your assets directory: {{path}}',
            button: 'Backup All Images',
            zipping: 'Zipping images...',
        },
        error: 'Backup failed.',
        errorDetail: 'Error: {{message}}',
        success: 'Downloaded {{count}} files.',
        noFiles: 'No files found to backup.',
        zipError: 'JSZip library is not loaded.',
    },
    fileUploader: {
        selected: 'Selected:',
        uploading: 'Uploading...',
        uploadButton: 'Upload File',
        success: 'Successfully uploaded {{name}}!',
        error: 'An unknown error occurred during upload.',
    },
    guide: {
        title: "Astro Content Manager Guide",
        welcome: {
          title: "Welcome!",
          p1: "Hello, I'm your frontend engineer. I'm happy to give you an overview of the Astro Content Manager application's structure and functionality. This is a very interesting and well-designed app!"
        },
        overview: {
          title: "Application Overview",
          purposeLabel: "Main Purpose:",
          purposeText: "\"Astro Content Manager\" is a client-side Web UI that allows you to manage content (Markdown/MDX posts and images) directly in your GitHub repository. It's especially useful for projects built with Astro.js. The goal is to simplify your workflow, helping you publish and update content without needing complex Git commands or a local development environment.",
          techLabel: "Technology Stack:",
          tech: {
            framework: "Frontend Framework: React and TypeScript.",
            styling: "Styling: Tailwind CSS for rapid and consistent UI development.",
            api: "API Interaction: Uses the browser's native",
            apiText: "API to call the GitHub REST API.",
            libs: "External Libraries (via CDN):",
            libsMarked: "To render Markdown into HTML securely.",
            libsJsZip: "To create",
            libsJsZip2: "archives for the backup feature.",
            special: "Special Feature:",
            specialText: "This application requires no build step. It uses an",
            specialText2: "in",
            specialText3: "to load React modules directly, allowing you to run it immediately just by opening the",
            specialText4: "file in your browser."
          }
        },
        workflow: {
          title: "Workflow",
          intro: "Here's how the application works from start to finish:",
          step1: {
            title: "Login & Connection:",
            li1: "The user accesses the app and sees the GitHub connection screen.",
            li2: {
              t1: "They enter their",
              strong1: "Repository URL",
              t2: "and a GitHub",
              strong2: "Fine-Grained Personal Access Token (PAT).",
              t3: "This token needs",
              code1: "Read and write",
              t4: "permissions for the repository's",
              code2: "Contents.",
              t5: ""
            }
          },
          step2: {
            title: "Authentication & Encryption:",
            li1: "The application validates the token and checks repository permissions.",
            li2: {
              t1: "If successful, the app encrypts the token using the",
              t2: "and stores it in the browser's",
              t3: ". This is much more secure than storing the token as plain text."
            },
            li3: "After saving, the app displays the main Dashboard interface."
          },
          step3: {
            title: "First-Time Setup:",
            li1: {
              t1: "When first accessing a repository's Dashboard, the app automatically scans for directories containing Markdown files (e.g.,",
            },
            li2: {
              t1: "It suggests these directories for you to select as your posts directory. Your choice is saved in",
              t2: "to streamline future visits."
            }
          },
          step4: {
            title: "Content Management:",
            li1: "The user interacts with the tabs on the Dashboard. All actions (reading, creating, editing, deleting files) are converted into corresponding API calls to GitHub.",
            li2: "Each action creates a new commit in the repository."
          },
          step5: {
            title: "Session End:",
            li1: {
              t1: "When the user clicks \"Log Out\" or closes the browser tab,",
              t2: "is automatically cleared, removing the encrypted token and key, ensuring security."
            }
          }
        },
        structure: {
          title: "Code Structure and Key File Roles",
          index: "The root HTML file, the starting point.",
          app: "The root component of the entire application, manages login state.",
          service: "The \"heart\" of the interaction with the GitHub API.",
          utils: "Directory containing utility functions like encryption and Markdown parsing.",
          components: "Directory containing all React components:",
          componentsDashboard: "The main interface after logging in.",
          componentsPostList: "Displays the list of posts.",
          componentsNewPost: "The interface for creating a new post.",
          componentsTemplate: "Generates a frontmatter template for validation.",
          componentsBackup: "Provides backup functionality.",
          componentsPicker: "The directory selection modal."
        },
        updating: {
            title: "Updating the Application",
            p1: "Because this is a completely client-side application that runs directly in the browser, updating to the latest version is very simple.",
            p2: "If you have cloned the project from GitHub, just navigate to the project directory on your computer and run the following command to get the latest updates:",
            code: "git pull origin main",
            p3: "After that, simply reload the `index.html` file in your browser, and you will be using the newest version!"
        }
      }
  },
  vi: {
    app: {
      logout: 'Đăng Xuất',
      error: {
        unknown: 'Đã xảy ra lỗi không xác định.',
        invalidRepoUrl: 'URL kho chứa GitHub không hợp lệ. Vui lòng kiểm tra lại.',
        noWritePermissions: 'Bạn không có quyền ghi vào kho chứa này.',
        loginFailed: 'Đăng nhập thất bại: {{message}}',
      }
    },
    githubConnect: {
      title: 'Astro Content Manager',
      subtitle: 'Kết nối với kho chứa GitHub của bạn để bắt đầu quản lý nội dung.',
      repoUrlLabel: 'URL Kho chứa',
      repoUrlPlaceholder: 'https://github.com/owner/repo-name',
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'github_pat_...',
      tokenHelp: {
        p1: 'Tạo một ',
        link: 'Fine-Grained Token',
        p2: ' với quyền ',
        b: '"Contents"',
        p3: ' đọc & ghi chỉ cho kho chứa này.',
      },
      connecting: 'Đang kết nối...',
      connectButton: 'Kết nối tới Kho chứa',
      tokenDisclaimer: 'Token của bạn được mã hóa và chỉ lưu trữ trong phiên duyệt web này.',
    },
    dashboard: {
      header: {
        title: 'Đang quản lý Kho chứa:',
        subtitle: 'Tổng quan về nội dung trong kho chứa của bạn.',
      },
      stats: {
        posts: 'Tổng số Bài viết',
        images: 'Tổng số Hình ảnh',
        lastUpdated: 'Cập nhật lần cuối',
        status: 'Trạng thái',
        connected: 'Đã kết nối',
      },
      nav: {
        manage: 'Quản lý Bài viết',
        create: 'Tạo Bài viết',
        template: 'Mẫu Bài viết',
        backup: 'Sao lưu',
        settings: 'Cài đặt',
        guide: 'Hướng dẫn',
        menuTitle: 'Trình đơn',
      },
      setup: {
        title: 'Yêu cầu Cài đặt Ban đầu',
        scanning: 'Đang quét kho chứa để tìm thư mục nội dung...',
        suggestionsTitle: 'Thư mục được gợi ý',
        suggestionsDesc: 'Chúng tôi đã tìm thấy các thư mục chứa file markdown. Hãy chọn một thư mục để bắt đầu.',
        suggestionsDefaultDesc: 'Chúng tôi không tìm thấy thư mục nội dung nào, nhưng có một thư mục phổ biến là \'src/data/post\'. Bạn có thể chọn nó để bắt đầu.',
        noSuggestions: 'Không thể tự động tìm thấy thư mục bài viết. Vui lòng chọn thư mục chứa các bài viết blog (`.md`/`.mdx`) của bạn.',
        manualOption: 'Hoặc, chọn một thư mục khác theo cách thủ công.',
        manualButton: 'Chọn Thư mục Thủ công',
        saveNote: 'Cài đặt này sẽ được lưu cho kho chứa này trong trình duyệt của bạn.',
      },
      settings: {
        directories: {
          title: 'Cài đặt Thư mục',
          postsLabel: 'Thư mục Bài viết',
          imagesLabel: 'Thư mục Hình ảnh',
          notSelected: 'Chưa chọn',
          changeButton: 'Thay đổi',
        },
        creation: {
            title: 'Cài đặt Tạo Bài viết',
            publishDateLabel: 'Ngày đăng bài',
            dateFromFile: 'Sử dụng ngày từ file (mặc định)',
            dateFromSystem: 'Sử dụng ngày hệ thống hiện tại',
            publishDateHelp: "Xác định `publishDate` trong frontmatter của bài viết mới khi tải lên.",
        },
        commits: {
          title: 'Mẫu Tin nhắn Commit',
          newPostLabel: 'Bài viết Mới',
          updatePostLabel: 'Cập nhật Bài viết',
          newImageLabel: 'Hình ảnh Mới',
          updateImageLabel: 'Cập nhật Hình ảnh của Bài viết',
          help: "Bạn có thể sử dụng `{filename}` làm placeholder trong mẫu.",
        },
        fileTypes: {
          title: 'Cài đặt Loại File',
          postLabel: 'Loại file Bài viết',
          postHelp: 'Danh sách các phần mở rộng hoặc loại MIME, cách nhau bởi dấu phẩy.',
          imageLabel: 'Loại file Hình ảnh',
          imageHelp: 'Ví dụ: `image/*` cho tất cả các loại ảnh.',
        },
      },
      footer: {
        sponsoredBy: 'Được tài trợ bởi',
      }
    },
    directoryPicker: {
        title: 'Chọn một Thư mục',
        currentPath: 'Đường dẫn hiện tại:',
        goUp: 'Đi lên',
        cancel: 'Hủy',
        select: 'Chọn thư mục này',
        error: 'Không thể tải nội dung thư mục. Đường dẫn có thể không tồn tại.',
    },
    postList: {
        loading: 'Đang tải bài viết...',
        error: {
            dirNotFound: 'Không tìm thấy thư mục: \'{{path}}\'. Vui lòng đảm bảo thư mục này tồn tại trong kho chứa của bạn. Bạn có thể thay đổi thư mục đích trong tab Cài đặt.',
        },
        noPosts: 'Không tìm thấy bài viết nào trong thư mục đã chọn.',
        searchPlaceholder: 'Tìm kiếm theo tiêu đề, tác giả, danh mục, thẻ...',
        noResults: 'Không tìm thấy kết quả nào cho tìm kiếm của bạn.',
        updateImage: 'Cập nhật ảnh',
        updateFile: 'Cập nhật file',
        by: 'bởi',
        category: 'Danh mục',
        tags: 'Thẻ',
        more: '+{{count}} thẻ nữa',
        pagination: {
            prev: 'Trước',
            pageInfo: 'Trang {{current}} trên {{total}}',
            next: 'Sau',
        },
        deleteConfirm: 'Bạn có chắc chắn muốn xóa "{{name}}"? Hành động này không thể hoàn tác.',
    },
    postPreview: {
        tabMetadata: 'Siêu dữ liệu',
        tabPreview: 'Xem trước',
        tabMarkdown: 'Markdown',
        delete: 'Xóa',
    },
    newPost: {
        step1Title: 'Bước 1: Tải lên Hình ảnh (Tùy chọn)',
        step1Desc: 'Nếu bài viết của bạn sử dụng hình ảnh mới, hãy tải chúng lên đây trước.',
        imageSelect: 'Chọn File Hình ảnh',
        imageSelectDesc: 'Bạn có thể chọn nhiều hình ảnh cùng một lúc.',
        imagePreviews: 'Xem trước Hình ảnh:',
        step2Title: 'Bước 2: Tải lên File Bài viết',
        step2Desc: 'Tải lên file markdown đã hoàn thành của bạn. Chúng tôi sẽ xác thực frontmatter của nó trước khi xuất bản.',
        validationInfo: {
            custom: 'Việc xác thực đang sử dụng <strong>mẫu tùy chỉnh</strong> của bạn. Đi đến tab "Mẫu Bài viết" để sửa đổi.',
            default: 'Sử dụng <strong>quy tắc xác thực mặc định</strong>. Bạn có thể đặt một mẫu tùy chỉnh trong tab "Mẫu Bài viết" để xác thực nghiêm ngặt hơn.',
        },
        postSelect: 'Chọn File Bài viết',
        postSelectDesc: 'Loại file được phép: .md, .mdx',
        processing: 'Đang xử lý file...',
        validationErrorTitle: 'Lỗi Xác thực:',
        validationSuccess: '✅ Xác thực thành công! File sẽ được xuất bản như đã cung cấp.',
        validationErrors: {
            missingField: "- Thiếu trường bắt buộc từ mẫu: '{{field}}'.",
            mustBeArray: "- Trường '{{field}}' phải là một mảng.",
            mustBeDate: "- Trường '{{field}}' phải là một ngày hợp lệ.",
            mustBeObject: "- Trường '{{field}}' phải là một đối tượng.",
            mustBeString: "- Trường '{{field}}' phải là một chuỗi.",
            missingDefaultField: "- Thiếu hoặc trống trường bắt buộc: '{{field}}'.",
            missingPublishDate: "- Thiếu trường bắt buộc: 'publishDate'.",
            invalidPublishDate: "- Trường 'publishDate' phải là một ngày hợp lệ.",
            missingTags: "- Trường 'tags' phải là một mảng không rỗng.",
            missingImage: "- Khi tải lên hình ảnh, trường 'image' trong frontmatter là bắt buộc và không được để trống.",
            fileReadError: 'Lỗi: Không thể đọc file.',
            parseError: 'Không thể xử lý file markdown.',
            validationFailIntro: 'Vui lòng sửa các vấn đề sau trong file của bạn:',
        },
        progress: {
            title: 'Tiến trình',
            step1: 'Tải lên Hình ảnh',
            step1Desc: 'Thêm hình ảnh mới cho bài viết của bạn.',
            step2: 'Tải lên & Xác thực Bài viết',
            step2Desc: 'File markdown của bạn phải hợp lệ.',
            step3: 'Xuất bản',
            step3Desc: 'Commit các file vào kho chứa của bạn.',
        },
        howItWorks: {
            title: 'Cách hoạt động',
            li1: 'Tải lên bất kỳ hình ảnh mới nào mà bài viết của bạn cần.',
            li2: 'Tải lên file `.md` hoặc `.mdx` cuối cùng của bạn.',
            li3: 'Chúng tôi sẽ xác thực frontmatter của file.',
            li4: 'Nhấp vào "Xuất bản" để commit mọi thứ.',
        },
        publishButton: 'Xuất bản Bài viết',
        publishing: 'Đang xuất bản...',
        publishSuccess: 'Đã xuất bản thành công "{{filename}}"',
        publishError: 'Cần có một file markdown hợp lệ để xuất bản.',
    },
    templateGenerator: {
        title: 'Mẫu Frontmatter cho Bài viết',
        description: 'Tạo một mẫu xác thực bằng cách tải lên một bài viết hiện có. Tính năng "Tạo Bài viết" sẽ sử dụng mẫu này để đảm bảo các bài viết mới có cấu trúc chính xác.',
        info: 'Nếu không có mẫu nào được đặt, tính năng "Tạo Bài viết" sẽ sử dụng các quy tắc xác thực mặc định, ít nghiêm ngặt hơn. Việc đặt một mẫu được khuyến khích cao để đảm bảo tính nhất quán.',
        uploadTitle: 'Tải lên một file bài viết để tạo mẫu tùy chỉnh',
        uploadDesc: '.md hoặc .mdx',
        processing: 'Đang xử lý...',
        error: {
            noFrontmatter: 'Không tìm thấy frontmatter trong file đã tải lên.',
            parse: 'Không thể phân tích cú pháp file.',
            read: 'Không thể đọc file.'
        },
        previewTitle: 'Xem trước Mẫu đã tạo',
        saveButton: 'Lưu làm Mẫu hoạt động',
        activeTitle: 'Mẫu đang hoạt động',
        defaultTitle: 'Mẫu Mặc định (Đang hoạt động)',
        downloadButton: 'Tải File Mẫu',
        useDefaultButton: 'Sử dụng Mẫu Mặc định',
        success: {
            saved: 'Đã lưu mẫu thành công!',
            default: 'Mẫu mặc định hiện đang hoạt động!',
        },
        table: {
            field: 'Tên trường',
            type: 'Loại dự kiến',
        }
    },
    backupManager: {
        posts: {
            title: 'Sao lưu Bài viết',
            description: 'Tạo một file nén .zip chứa tất cả các file markdown từ thư mục nội dung của bạn: {{path}}',
            button: 'Sao lưu Tất cả Bài viết',
            zipping: 'Đang nén bài viết...',
        },
        images: {
            title: 'Sao lưu Hình ảnh',
            description: 'Tạo một file nén .zip chứa tất cả các file từ thư mục tài sản của bạn: {{path}}',
            button: 'Sao lưu Tất cả Hình ảnh',
            zipping: 'Đang nén hình ảnh...',
        },
        error: 'Sao lưu thất bại.',
        errorDetail: 'Lỗi: {{message}}',
        success: 'Đã tải xuống {{count}} file.',
        noFiles: 'Không tìm thấy file nào để sao lưu.',
        zipError: 'Thư viện JSZip chưa được tải.',
    },
    fileUploader: {
        selected: 'Đã chọn:',
        uploading: 'Đang tải lên...',
        uploadButton: 'Tải File lên',
        success: 'Đã tải lên thành công {{name}}!',
        error: 'Đã xảy ra lỗi không xác định trong quá trình tải lên.',
    },
    guide: {
      title: "Hướng dẫn sử dụng Astro Content Manager",
      welcome: {
        title: "Chào mừng bạn!",
        p1: "Chào bạn, tôi là kỹ sư frontend của bạn đây. Rất vui được giải thích tổng quan về cấu trúc và cách hoạt động của ứng dụng Astro Content Manager. Đây là một ứng dụng rất thú vị và được thiết kế tốt!"
      },
      overview: {
        title: "Tổng Quan Ứng Dụng",
        purposeLabel: "Mục đích chính:",
        purposeText: "\"Astro Content Manager\" là một giao diện web (Web UI) hoạt động hoàn toàn phía trình duyệt (client-side). Nó cho phép bạn quản lý nội dung (bài viết Markdown/MDX và hình ảnh) trực tiếp trên kho chứa (repository) GitHub của mình, đặc biệt hữu ích cho các dự án xây dựng bằng Astro.js. Mục tiêu là đơn giản hóa quy trình làm việc, giúp bạn đăng bài, cập nhật nội dung mà không cần dùng đến các lệnh Git phức tạp hay môi trường lập trình local.",
        techLabel: "Công nghệ sử dụng:",
        tech: {
          framework: "Frontend Framework: React và TypeScript.",
          styling: "Styling: Tailwind CSS để xây dựng giao diện nhanh chóng và nhất quán.",
          api: "Tương tác API: Sử dụng trực tiếp",
          apiText: "API của trình duyệt để gọi đến GitHub REST API.",
          libs: "Thư viện ngoài (tải qua CDN):",
          libsMarked: "Để render nội dung Markdown thành HTML một cách an toàn.",
          libsJsZip: "Để tạo file nén",
          libsJsZip2: "cho chức năng sao lưu (backup).",
          special: "Điểm đặc biệt:",
          specialText: "Ứng dụng này không cần bước build (build step). Nó sử dụng",
          specialText2: "trong",
          specialText3: "để tải các module React trực tiếp, giúp bạn có thể chạy nó ngay lập tức chỉ bằng cách mở file",
          specialText4: "trên trình duyệt."
        }
      },
      workflow: {
        title: "Luồng Hoạt Động (Workflow)",
        intro: "Đây là cách ứng dụng hoạt động từ đầu đến cuối:",
        step1: {
          title: "Đăng nhập & Kết nối:",
          li1: "Người dùng truy cập ứng dụng và thấy màn hình kết nối GitHub.",
          li2: {
            t1: "Họ nhập vào",
            strong1: "Repository URL",
            t2: "và một",
            strong2: "Fine-Grained Personal Access Token (PAT)",
            t3: "của GitHub. Token này cần có quyền",
            code1: "Read and write",
            t4: "vào mục",
            code2: "Contents",
            t5: "của kho chứa."
          }
        },
        step2: {
          title: "Xác thực & Mã hóa:",
          li1: "Ứng dụng xác thực token và kiểm tra quyền truy cập vào repo.",
          li2: {
            t1: "Nếu thành công, ứng dụng sẽ mã hóa token bằng",
            t2: "và lưu vào",
            t3: "của trình duyệt. Việc này an toàn hơn nhiều so với việc lưu token dưới dạng văn bản thuần."
          },
          li3: "Sau khi lưu, ứng dụng sẽ hiển thị giao diện chính là Dashboard."
        },
        step3: {
          title: "Thiết lập lần đầu:",
          li1: {
            t1: "Khi vào Dashboard lần đầu cho một repo, ứng dụng sẽ tự động quét kho chứa để tìm các thư mục có chứa file Markdown (ví dụ:",
          },
          li2: {
            t1: "Nó sẽ gợi ý các thư mục này cho bạn chọn làm thư mục bài viết. Lựa chọn của bạn sẽ được lưu vào",
            t2: "để các lần truy cập sau không cần chọn lại."
          }
        },
        step4: {
          title: "Quản lý Nội dung:",
          li1: "Người dùng tương tác với các tab trên Dashboard. Mọi hành động (đọc, tạo, sửa, xóa file) đều được chuyển thành các lệnh gọi API tương ứng đến GitHub.",
          li2: "Mỗi hành động sẽ tạo ra một commit mới trên repo."
        },
        step5: {
          title: "Kết thúc phiên:",
          li1: {
            t1: "Khi người dùng bấm \"Log Out\" hoặc đóng tab trình duyệt,",
            t2: "sẽ tự động bị xóa, đồng nghĩa với việc token và khóa mã hóa cũng bị xóa, đảm bảo an toàn."
          }
        }
      },
      structure: {
        title: "Cấu Trúc Code và Vai Trò Các File Chính",
        index: "File HTML gốc, là điểm khởi đầu.",
        app: "Component gốc của toàn bộ ứng dụng, quản lý trạng thái đăng nhập.",
        service: "\"Trái tim\" của việc tương tác với GitHub API.",
        utils: "Thư mục chứa các hàm tiện ích như mã hóa và phân tích Markdown.",
        components: "Thư mục chứa tất cả các component React:",
        componentsDashboard: "Giao diện chính sau khi đăng nhập.",
        componentsPostList: "Hiển thị danh sách các bài viết.",
        componentsNewPost: "Giao diện tạo bài viết mới.",
        componentsTemplate: "Tạo mẫu frontmatter để xác thực.",
        componentsBackup: "Cung cấp chức năng sao lưu.",
        componentsPicker: "Cửa sổ chọn thư mục."
      },
      updating: {
        title: "Cập nhật Ứng dụng",
        p1: "Vì đây là một ứng dụng hoạt động hoàn toàn phía trình duyệt (client-side), việc cập nhật lên phiên bản mới nhất rất đơn giản.",
        p2: "Nếu bạn đã sao chép (clone) dự án từ GitHub, bạn chỉ cần đi đến thư mục dự án trên máy tính và chạy lệnh sau để lấy về các cập nhật mới nhất:",
        code: "git pull origin main",
        p3: "Sau đó, chỉ cần tải lại file `index.html` trong trình duyệt là bạn đã sử dụng phiên bản mới nhất!"
      }
    }
  }
};
