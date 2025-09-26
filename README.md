# 🍽️ SIUPO Restaurant - Admin Dashboard

Hệ thống quản trị dành cho nhà hàng SIUPO, được xây dựng bằng React và Material-UI với thiết kế hiện đại và thân thiện với người dùng.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Scripts có sẵn](#-scripts-có-sẵn)
- [Cấu hình Git](#-cấu-hình-git)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Đóng góp](#-đóng-góp)

## ✨ Tính năng

- 🏠 **Dashboard tổng quan**: Thống kê và báo cáo tổng quan
- 🍕 **Quản lý menu**: Thêm, sửa, xóa món ăn và danh mục
- 👥 **Quản lý khách hàng**: Theo dõi thông tin khách hàng
- 📊 **Báo cáo doanh thu**: Phân tích và báo cáo chi tiết
- 🎨 **Giao diện responsive**: Tối ưu cho mọi thiết bị
- 🔒 **Xác thực và phân quyền**: Bảo mật cao

## 🛠 Công nghệ sử dụng

### Frontend Framework

- **React 19.1.0** - Thư viện UI chính
- **Vite 6.3.5** - Build tool và dev server

### UI Libraries

- **Material-UI 7.1.0** - Component library
- **@tabler/icons-react 3.31.0** - Icon set
- **Framer Motion 12.10.1** - Animation library

### Development Tools

- **ESLint 9.25.1** - Code linting
- **Prettier 3.5.3** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Conventional commit messages
- **Lint-staged** - Pre-commit code quality checks

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Git**: >= 2.0.0

## ⚙️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd siupo-restaurant-admin
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example` và cập nhật các biến môi trường:

```bash
cp .env.example .env
```

## 🚀 Sử dụng

### Development Mode

```bash
npm run dev
```

Ứng dụng sẽ chạy trên [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📜 Scripts có sẵn

| Script             | Mô tả                              |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Chạy ứng dụng ở chế độ development |
| `npm run build`    | Build ứng dụng cho production      |
| `npm run preview`  | Preview bản build production       |
| `npm run lint`     | Kiểm tra lỗi ESLint                |
| `npm run lint:fix` | Tự động sửa lỗi ESLint             |
| `npm run prettier` | Format code với Prettier           |
| `npm run prepare`  | Khởi tạo Husky hooks               |

## 🔧 Cấu hình Git

### Commit Message Convention

Project sử dụng [Conventional Commits](https://www.conventionalcommits.org/) để chuẩn hóa commit messages:

```bash
# ✅ Đúng
feat: thêm trang quản lý menu
fix: sửa lỗi hiển thị dashboard
docs: cập nhật README
style: format code với prettier
refactor: tái cấu trúc component header

# ❌ Sai
add menu page
fix bug
update
```

### Git Hooks

- **pre-commit**: Tự động chạy lint và format code
- **commit-msg**: Kiểm tra format của commit message

### Workflow đề xuất

```bash
# 1. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 2. Commit với conventional format
git add .
git commit -m "feat: thêm tính năng mới"

# 3. Push và tạo Pull Request
git push origin feature/ten-tinh-nang
```

## 📁 Cấu trúc thư mục

```
src/
├── api/              # API services
├── assets/           # Static assets (images, icons)
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── layout/           # Layout components
│   ├── MainLayout/   # Main dashboard layout
│   └── MinimalLayout/ # Auth layout
├── menu-items/       # Navigation menu configuration
├── routes/           # Route definitions
├── store/            # Global state management
├── themes/           # Material-UI theme configuration
├── ui-component/     # Reusable UI components
├── utils/            # Utility functions
└── views/            # Page components
    ├── dashboard/    # Dashboard pages
    ├── pages/        # Other pages
    └── utilities/    # Utility pages
```

### Code Style

- Sử dụng **Prettier** để format code
- Tuân thủ **ESLint** rules
- Viết **commit messages** theo Conventional Commits
- Thêm **comments** cho logic phức tạp
- Viết **PropTypes** hoặc **TypeScript** cho components
