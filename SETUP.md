# Hướng dẫn tích hợp thủ công Astro GitHub Content Manager

Nếu bạn muốn tùy chỉnh mã nguồn của Astro GitHub Content Manager hoặc không muốn cài đặt nó qua npm, bạn có thể tích hợp nó vào dự án Astro hiện có của mình theo các bước sau.

## 🚀 Bắt đầu

### Yêu cầu tiên quyết (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo bạn có:
- Một dự án Astro hiện có.
- Dự án của bạn phải là một kho lưu trữ Git với một remote có tên `origin` trỏ đến kho lưu trữ GitHub của bạn. Integration này sử dụng thông tin này để tự động xác định nơi đẩy nội dung.
- Node.js và một trình quản lý gói (npm, pnpm, hoặc yarn) đã được cài đặt.


### Bước 1: Sao chép các tệp mã nguồn

Tạo một thư mục mới tại `src/integrations/content-manager` trong dự án Astro của bạn và sao chép các tệp của integration này vào đó.

**Cấu trúc thư mục mong muốn:**

```
my-astro-project/
└── src/
    └── integrations/
        └── content-manager/
            ├── components/
            ├── pages/
            │   └── dashboard.astro
            ├── services/
            ├── App.tsx
            ├── integration.ts
            └── types.ts
```

### Bước 2: Cài đặt các gói phụ thuộc

Integration này yêu cầu một số gói để hoạt động. Bạn cần cài đặt chúng trong dự án của mình.

```bash
# Cần có React để render giao diện
npx astro add react

# Cần có simple-git để tự động nhận diện repo
npm install simple-git
```

### Bước 3: Cập nhật `astro.config.mjs`

Mở tệp `astro.config.mjs` ở thư mục gốc của dự án Astro của bạn và thêm integration vào mảng `integrations`.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Import integration từ vị trí bạn đã sao chép
import contentManager from './src/integrations/content-manager/integration.ts';

export default defineConfig({
  integrations: [
    react(),
    contentManager({ route: '/admin' }) // Tùy chỉnh đường dẫn truy cập
  ]
});
```

### Bước 4: Sử dụng

1.  **Tạo GitHub Token:** Tạo một GitHub Fine-Grained Personal Access Token với quyền **"Read and write"** cho mục **"Contents"** trên kho lưu trữ của bạn.
2.  **Chạy dự án:** `npm run dev`.
3.  **Truy cập:** Mở trình duyệt và đi đến đường dẫn bạn đã cấu hình (ví dụ: `http://localhost:4321/admin`).
4.  **Đăng nhập:** Dán token của bạn vào để bắt đầu quản lý nội dung.