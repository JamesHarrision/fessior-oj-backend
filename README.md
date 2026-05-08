# Hệ thống Chấm điểm Mã nguồn Trực tuyến (Online Code Judge - OCJ)

Đây là một monorepo theo kiến trúc microservices cho nền tảng Online Code Judge, được xây dựng bằng Node.js, Express, Prisma và TurboRepo.

## Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (Khuyến nghị v18+)
- [Docker](https://www.docker.com/) & Docker Compose
- npm (Khuyến nghị v10+)

## Cấu trúc Dự án

- `apps/main-service`: API backend chính sử dụng Express.js và Prisma.
- `packages/`: Các package dùng chung trong toàn bộ monorepo (ví dụ: types, tsconfig).
- Hạ tầng (quản lý qua Docker):
  - **MySQL** (`mysql:8.0` trên cổng `3307`)
  - **MongoDB** (`mongo:6.0` trên cổng `27017`)
  - **Redis** (`redis:7-alpine` trên cổng `6379`)

## Hướng dẫn Cài đặt

Làm theo các bước sau để thiết lập và chạy dự án ở môi trường local.

### 1. Cài đặt Thư viện

Từ thư mục gốc của dự án, cài đặt tất cả các dependencies cho monorepo:

```bash
npm install
```

### 2. Khởi chạy Hạ tầng (Databases & Redis)

Khởi động các cơ sở dữ liệu và dịch vụ caching chạy ngầm bằng Docker Compose. Cấu hình được lấy từ file `.env.docker`.

```bash
docker-compose up -d
```

### 3. Thiết lập Biến môi trường

Đảm bảo `main-service` đã được cấu hình đúng các biến môi trường. Kiểm tra file `apps/main-service/.env`. 
Theo mặc định, cấu hình này sẽ khớp với cấu hình Docker ở local:

```env
PORT=6868
DATABASE_URL="mysql://root:ocj_root_secret@localhost:3307/ocj_main_db"
```

*(Nếu file `.env` không tồn tại, hãy copy từ file `.env.example` sang `.env` và điền các giá trị).*

### 4. Cập nhật Database Schema (Prisma)

Di chuyển vào thư mục `main-service` để đồng bộ (push) Prisma schema lên cơ sở dữ liệu MySQL đang chạy.

```bash
cd apps/main-service
npm run db:push
```

### 5. Chạy Ứng dụng

Bạn có thể khởi động development server bằng TurboRepo từ **thư mục gốc**. Lệnh này sẽ chạy kịch bản `dev` song song trên tất cả các ứng dụng.

```bash
# Từ thư mục gốc (online-code-judge)
npm run dev
```

Hoặc, nếu bạn chỉ muốn chạy riêng main service:

```bash
cd apps/main-service
npm run dev
```

## Các Lệnh Hữu ích Khác

Các lệnh này chạy từ thư mục gốc:
- `npm run build`: Build toàn bộ workspaces bằng Turbo.
- `npm run lint`: Chạy lint để kiểm tra lỗi code.
- `npm run format`: Format lại code bằng Prettier.
- `docker-compose down`: Dừng và xóa các container Docker.

Để xem cơ sở dữ liệu trực quan bằng Prisma Studio:
```bash
cd apps/main-service
npm run db:studio
```
