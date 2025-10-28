Chào bạn, tôi là kỹ sư frontend của bạn đây. Rất vui được giải thích tổng quan về cấu trúc và cách hoạt động của ứng dụng Astro Content Manager. Đây là một ứng dụng rất thú vị và được thiết kế tốt!
### Tổng Quan Ứng Dụng
**Mục đích chính:** "Astro Content Manager" là một giao diện web (Web UI) hoạt động hoàn toàn phía trình duyệt (client-side). Nó cho phép bạn quản lý nội dung (bài viết Markdown/MDX và hình ảnh) trực tiếp trên kho chứa (repository) GitHub của mình, đặc biệt hữu ích cho các dự án xây dựng bằng Astro.js. Mục tiêu là đơn giản hóa quy trình làm việc, giúp bạn đăng bài, cập nhật nội dung mà không cần dùng đến các lệnh Git phức tạp hay môi trường lập trình local.
**Công nghệ sử dụng:**
*   **Frontend Framework:** React và TypeScript.
*   **Styling:** Tailwind CSS để xây dựng giao diện nhanh chóng và nhất quán.
*   **Tương tác API:** Sử dụng trực tiếp fetch API của trình duyệt để gọi đến GitHub REST API.
*   **Thư viện ngoài (tải qua CDN):**
    *   `Marked` & `DOMPurify`: Để render nội dung Markdown thành HTML một cách an toàn.
    *   `JSZip`: Để tạo file nén .zip cho chức năng sao lưu (backup).
*   **Điểm đặc biệt:** Ứng dụng này không cần bước build (build step). Nó sử dụng importmap trong index.html để tải các module React trực tiếp, giúp bạn có thể chạy nó ngay lập tức chỉ bằng cách mở file index.html trên trình duyệt.
### Luồng Hoạt Động (Workflow)
Đây là cách ứng dụng hoạt động từ đầu đến cuối:
1.  **Đăng nhập & Kết nối:**
    *   Người dùng truy cập ứng dụng và thấy màn hình GithubConnect.
    *   Họ nhập vào Repository URL và một Fine-Grained Personal Access Token (PAT) của GitHub. Token này cần có quyền đọc và ghi (Read and write) vào mục Contents của kho chứa.
2.  **Xác thực & Mã hóa:**
    *   Component App.tsx nhận token và URL, sau đó gọi githubService để xác thực token và kiểm tra quyền truy cập vào repo.
    *   Nếu thành công, ứng dụng sẽ thực hiện một bước bảo mật quan trọng:
        *   Nó dùng Web Crypto API (trong utils/crypto.ts) để tạo một khóa mã hóa (CryptoKey).
        *   Token PAT sẽ được mã hóa bằng khóa này.
        *   Token đã mã hóa và khóa mã hóa sẽ được lưu vào sessionStorage của trình duyệt. Việc này an toàn hơn nhiều so với việc lưu token dưới dạng văn bản thuần.
    *   Sau khi lưu, ứng dụng sẽ hiển thị giao diện chính là Dashboard.
3.  **Thiết lập lần đầu:**
    *   Khi vào Dashboard lần đầu cho một repo, ứng dụng sẽ tự động quét kho chứa (githubService.scanForContentDirectories) để tìm các thư mục có chứa file Markdown (ví dụ: src/content/blog, src/posts).
    *   Nó sẽ gợi ý các thư mục này cho bạn chọn làm thư mục bài viết. Lựa chọn của bạn sẽ được lưu vào localStorage để các lần truy cập sau không cần chọn lại. Đây là một tính năng rất thông minh giúp cải thiện trải nghiệm người dùng.
4.  **Quản lý Nội dung:**
    *   Người dùng tương tác với các tab trên Dashboard. Mọi hành động (đọc, tạo, sửa, xóa file) đều được githubService chuyển thành các lệnh gọi API tương ứng đến GitHub.
    *   Ví dụ, khi bạn tải lên một file, githubService sẽ chuyển file đó sang định dạng Base64 và gửi lên GitHub thông qua một lệnh PUT. Mỗi hành động sẽ tạo ra một commit mới trên repo.
5.  **Kết thúc phiên:**
    *   Khi người dùng bấm "Log Out" hoặc đóng tab trình duyệt, sessionStorage sẽ tự động bị xóa, đồng nghĩa với việc token và khóa mã hóa cũng bị xóa, đảm bảo an toàn.
### Cấu Trúc Code và Vai Trò Các File Chính
*   **index.html**: File HTML gốc, là điểm khởi đầu. Nó tải CSS, các thư viện JS từ CDN và file index.tsx để khởi chạy ứng dụng React.
*   **App.tsx**: Component gốc của toàn bộ ứng dụng.
    *   Quản lý trạng thái đăng nhập (token, thông tin user, repo đã chọn).
    *   Điều khiển luồng xác thực, mã hóa và lưu trữ session.
    *   Quyết định hiển thị màn hình đăng nhập (GithubConnect) hay giao diện quản lý (Dashboard).
*   **services/githubService.ts**: "Trái tim" của việc tương tác với GitHub.
    *   Đây là lớp trừu tượng (abstraction layer) cho tất cả các lệnh gọi GitHub API.
    *   Chứa các hàm như getRepoContents (lấy danh sách file trong thư mục), uploadFile (tải file lên), deleteFile (xóa file)...
    *   Xử lý việc mã hóa/giải mã Base64 cho nội dung file, một yêu cầu của GitHub API.
*   **utils/**: Thư mục chứa các hàm tiện ích.
    *   **crypto.ts**: Chứa logic mã hóa và giải mã token PAT phía trình duyệt, một điểm cộng lớn về bảo mật.
    *   **parsing.ts**: Rất quan trọng, chứa các hàm để:
        *   `parseMarkdown`: Tách metadata (frontmatter) và nội dung chính (body) từ một file Markdown. Nó đủ thông minh để nhận diện các key phổ biến cho ảnh bìa như image, thumbnail, cover.
        *   `updateFrontmatter`: Cập nhật lại frontmatter một cách tự động.
        *   `slugify`: Chuyển đổi tiêu đề bài viết thành một chuỗi URL thân thiện.
*   **components/**: Thư mục chứa tất cả các component React.
    *   **Dashboard.tsx**: Component chính sau khi đăng nhập, chứa các tab chức năng.
    *   **PostList.tsx**: Hiển thị danh sách các bài viết dưới dạng thẻ (card), có chức năng tìm kiếm, phân trang và các nút hành động (sửa, xóa, xem trước).
    *   **NewPostCreator.tsx**: Giao diện theo từng bước để tạo một bài viết mới. Nó có chức năng xác thực (validate) frontmatter dựa trên một "template" để đảm bảo tính nhất quán.
    *   **TemplateGenerator.tsx**: Một tính năng nâng cao cho phép bạn tạo một mẫu frontmatter chuẩn bằng cách tải lên một bài viết đã có. Các bài viết mới sau này sẽ phải tuân theo mẫu này.
    *   **BackupManager.tsx**: Cung cấp chức năng tải về bản sao lưu của thư mục bài viết hoặc hình ảnh dưới dạng file .zip.
    *   **DirectoryPicker.tsx**: Một cửa sổ (modal) trực quan giúp người dùng duyệt qua cấu trúc thư mục trên repo và chọn một thư mục.
### Cập nhật Ứng dụng
Vì đây là một ứng dụng hoạt động hoàn toàn phía trình duyệt (client-side) và không cần bước build, việc cập nhật lên phiên bản mới nhất rất đơn giản.
Nếu bạn đã sao chép (clone) dự án từ GitHub, bạn chỉ cần đi đến thư mục dự án trên máy tính và chạy lệnh sau để lấy về các cập nhật mới nhất từ nhánh `main`:
```bash
git pull origin main
```
Sau đó, chỉ cần tải lại file `index.html` trong trình duyệt là bạn đã sử dụng phiên bản mới nhất!
