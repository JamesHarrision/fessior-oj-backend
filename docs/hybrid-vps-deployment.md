# Hướng Dẫn Triển Khai Hybrid OCJ Trên VPS

## Kiến Trúc Hybrid

```
┌─────────────────────────────────────────────────────┐
│                     VPS                              │
│                                                      │
│  ┌─────────────── Docker ────────────────────────┐   │
│  │  ┌──────┐  ┌────────┐  ┌─────┐  ┌──────────┐ │   │
│  │  │MySQL │  │MongoDB │  │Redis│  │ Judge0   │ │   │
│  │  │:3307 │  │:27017  │  │:6379│  │:2358     │ │   │
│  │  └──────┘  └────────┘  └─────┘  └──────────┘ │   │
│  └────────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── PM2 (Node.js 20) ──────────────────────────┐   │
│  │  ┌──────────────┐    ┌──────────────────┐      │   │
│  │  │ main-service │    │ worker-service   │      │   │
│  │  │ :6868        │    │ (internal only)  │      │   │
│  │  └──────────────┘    └──────────────────┘      │   │
│  └────────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── Nginx (Reverse Proxy) ─────────────────────┐   │
│  │  api.domain.com → localhost:6868              │   │
│  │  domain.com     → frontend (static build)     │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Lý do chọn Hybrid:**
- Docker all-in-one bị lỗi chấm bài vì Judge0 dùng `isolate` (cgroup) không chạy được trong container lồng container (Docker-in-Docker). Khi chạy Judge0 native Docker (privileged) và main-service/worker-service chạy trực tiếp trên VPS, Judge0 hoạt động bình thường.
- Dễ debug và log hơn khi chạy service trực tiếp.
- Có thể scale/dừng từng service riêng lẻ.

---

## 1. Chuẩn Bị VPS

### Yêu cầu tối thiểu:
- **OS**: Ubuntu 20.04 / 22.04 / 24.04
- **RAM**: ≥ 4GB (khuyến nghị 8GB)
- **CPU**: ≥ 2 cores
- **Disk**: ≥ 20GB SSD

### SSH vào VPS

```bash
ssh root@<IP_VPS>
```

---

## 2. Cài Đặt Môi Trường

Chạy script setup có sẵn (hoặc chạy thủ công nếu script lỗi):

```bash
cd /root
git clone <URL_REPO> ocj
cd ocj
chmod +x setup_vps.sh
./setup_vps.sh
```

Script này sẽ cài:
- Swap 4GB (chống OOM)
- Docker + Docker Compose
- Nginx + Git + Certbot

### Cài thêm Node.js 20 (LTS)

Script `setup_vps.sh` **không** cài Node.js, cần cài thêm:

```bash
# Cài Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Kiểm tra
node --version  # mong muốn: v20.x
npm --version   # mong muốn: 10.x
```

### Cài PM2 (quản lý process cho Node.js)

```bash
npm install -g pm2
pm2 --version
```

---

## 3. Clone Code & Cài Dependencies

```bash
# Đã clone ở bước 2, nếu chưa thì:
cd /root
git clone <URL_REPO> ocj
cd ocj

# Cài dependencies monorepo
npm install

# Kiểm tra turbo
npx turbo --version   # mong muốn: 2.0.0
```

---

## 4. Cấu Hình Environment

### 4.1. Tạo `.env.docker` cho Docker infra

```bash
cp .env.docker.example .env.docker
```

Chỉnh sửa `.env.docker` nếu cần. Mặc định đã OK cho hybrid:

```dotenv
MYSQL_ROOT_PASSWORD=ocj_root_secret
MYSQL_DATABASE=ocj_main_db
MYSQL_USER=ocj_user
MYSQL_PASSWORD=ocj_secret_pass
MONGO_INITDB_ROOT_USERNAME=mongoadmin
MONGO_INITDB_ROOT_PASSWORD=mongosecret

# Các service app sẽ kết nối qua localhost
PORT=6868
DATABASE_URL=mysql://root:ocj_root_secret@mysql:3306/ocj_main_db
MONGO_URI=mongodb://mongoadmin:mongosecret@mongodb:27017/ocj_database?authSource=admin
REDIS_HOST=redis
REDIS_PORT=6379
```

### 4.2. Tạo `.env` cho main-service

```bash
cat > /root/ocj/apps/main-service/.env << 'EOF'
PORT=6868
DATABASE_URL="mysql://root:ocj_root_secret@localhost:3307/ocj_main_db"
MONGO_URI="mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_ACCESS_SECRET="your_jwt_access_secret_here_change_this_in_prod"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_here_change_this_in_prod"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_password"
GEMINI_API_KEY="your_gemini_api_key"
RAPIDAPI_KEY=""
RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"
JUDGE0_URL="http://localhost:2358"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
ENABLE_LOCAL_FALLBACK="true"
EOF
```

> **⚠️ QUAN TRỌNG**: `DATABASE_URL` trỏ đến `localhost:3307` (port Docker expose ra), không phải host `mysql` trong Docker network.
> `ENABLE_LOCAL_FALLBACK="true"` cho phép fallback về local execution nếu Judge0 gặp lỗi.

### 4.3. Tạo `.env` cho worker-service

```bash
cat > /root/ocj/apps/worker-service/.env << 'EOF'
REDIS_HOST="localhost"
REDIS_PORT=6379
MONGO_URI="mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin"
JUDGE0_URL="http://localhost:2358"
RAPIDAPI_KEY=""
RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"
ENABLE_LOCAL_FALLBACK="true"
EOF
```

---

## 5. Cấu Hình Judge0

### 5.1. Đặt password cho Judge0

Sửa file `judge0-server/judge0-v1.13.0/judge0.conf`, set mật khẩu cho Redis và PostgreSQL:

```bash
# Mở file và sửa 2 dòng sau
nano /root/ocj/judge0-server/judge0-v1.13.0/judge0.conf
```

```conf
REDIS_PASSWORD=Judge0RedisPass123
POSTGRES_PASSWORD=Judge0PostgresPass123
```

**Lưu ý**: Các service `server` và `workers` trong judge0-compose dùng `network_mode` mặc định là bridge riêng. Vì main-service/worker-service chạy trên host, cần đảm bảo Judge0 server expose đúng port `2358`.

---

## 6. Khởi Động Docker Infra

### 6.1. Khởi động MySQL, MongoDB, Redis

```bash
cd /root/ocj

# Dùng docker-compose.yml ở root, chỉ chạy các service infra
docker compose up -d mysql mongodb redis
```

Kiểm tra:

```bash
docker compose ps
docker compose logs mysql mongodb redis
```

### 6.2. Khởi động Judge0

```bash
cd /root/ocj

docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml up -d
```

Judge0 cần vài phút để khởi tạo lần đầu (tạo DB migrations). Kiểm tra:

```bash
docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml logs -f server
# Đợi đến khi thấy: "Listening on ... 2358"
```

Kiểm tra Judge0 API:

```bash
curl http://localhost:2358/about
# Mong muốn: JSON response có thông tin về Judge0
```

> **Lưu ý**: Judge0 workers chạy với `privileged: true` — đây là điều kiện bắt buộc để Judge0 dùng `isolate` sandbox. Nếu chạy main-service/worker-service trong Docker container khác, sandbox sẽ bị lỗi (Error 13). Chạy hybrid giải quyết vấn đề này.

---

## 7. Build main-service & worker-service

### 7.1. Build các packages chung

```bash
cd /root/ocj

# Build tất cả packages và services
npm run build
```

Lệnh này chạy `turbo run build` sẽ build lần lượt:
- `packages/tsconfig`
- `packages/types`
- `packages/errors`
- `packages/constants`
- `packages/utils`
- `packages/validators`
- `packages/executor`
- `apps/main-service`
- `apps/worker-service`

### 7.2. Generate Prisma Client

```bash
cd /root/ocj/apps/main-service
npx prisma generate
```

### 7.3. Push schema MySQL

```bash
cd /root/ocj/apps/main-service
npx prisma db push
```

### 7.4. Seed dữ liệu (nếu cần)

```bash
cd /root/ocj
npm run seed
```

---

## 8. Khởi Động Services Bằng PM2

### 8.1. Tạo PM2 ecosystem config

```bash
cat > /root/ocj/ecosystem.config.cjs << 'ECOSCRIPT'
module.exports = {
  apps: [
    {
      name: 'main-service',
      cwd: '/root/ocj/apps/main-service',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 6868,
      },
      error_file: '/root/ocj/logs/main-service-error.log',
      out_file: '/root/ocj/logs/main-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
    },
    {
      name: 'worker-service',
      cwd: '/root/ocj/apps/worker-service',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/root/ocj/logs/worker-service-error.log',
      out_file: '/root/ocj/logs/worker-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
ECOSCRIPT
```

### 8.2. Tạo thư mục logs

```bash
mkdir -p /root/ocj/logs
```

### 8.3. Start services

```bash
cd /root/ocj
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # để PM2 tự động chạy khi VPS reboot
```

Kiểm tra:

```bash
pm2 status
pm2 logs main-service --lines 20
pm2 logs worker-service --lines 20
```

---

## 9. Kiểm Tra Hoạt Động

### 9.1. Kiểm tra API main-service

```bash
curl http://localhost:6868/api-docs       # Swagger UI (HTML)
curl http://localhost:6868/health         # Health check endpoint (nếu có)
```

### 9.2. Kiểm tra Judge0

```bash
# Lấy danh sách ngôn ngữ Judge0 hỗ trợ
curl http://localhost:2358/languages | head -20
```

### 9.3. Kiểm tra worker-service log

```bash
pm2 logs worker-service --lines 20
# Mong muốn thấy:
# "MongoDB connected successfully inside worker-service"
# "Submission Queue Worker started successfully"
```

---

## 10. Cấu Hình Nginx (Tùy Chọn)

Nếu muốn truy cập API qua domain thay vì IP:port:

### 10.1. Tạo Nginx site config

```bash
cat > /etc/nginx/sites-available/ocj-api << 'NGINX'
server {
    listen 80;
    server_name api.ocj.domain.com;

    location / {
        proxy_pass http://127.0.0.1:6868;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Tăng timeout cho Judge0 submissions (có thể chạy lâu)
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
NGINX

ln -s /etc/nginx/sites-available/ocj-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 10.2. Cài SSL (Certbot)

```bash
certbot --nginx -d api.ocj.domain.com
```

---

## 11. Triển Khai Frontend (Tùy Chọn)

### Build frontend

```bash
cd /root/ocj/apps/frontend
npm run build
# Output ở /root/ocj/apps/frontend/dist/
```

### Cấu hình Nginx serve frontend

```bash
cat > /etc/nginx/sites-available/ocj-frontend << 'NGINX'
server {
    listen 80;
    server_name ocj.domain.com;

    root /root/ocj/apps/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:6868;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:6868;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ocj-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 12. Script Deploy Nhanh

Tạo script `/root/ocj/deploy-hybrid.sh` để deploy mỗi khi có code mới:

```bash
cat > /root/ocj/deploy-hybrid.sh << 'DEPLOYSCRIPT'
#!/bin/bash
set -e

echo "=========================================="
echo "  OCJ Hybrid Deploy"
echo "=========================================="

cd /root/ocj

# 1. Pull code mới
echo "[1/6] Pull code mới..."
git pull

# 2. Cài dependencies
echo "[2/6] npm install..."
npm install

# 3. Build
echo "[3/6] Build..."
npm run build

# 4. Generate Prisma & Push
echo "[4/6] Prisma..."
cd apps/main-service
npx prisma generate
npx prisma db push
cd /root/ocj

# 5. Restart services
echo "[5/6] Restart PM2..."
pm2 restart main-service worker-service
pm2 save

# 6. Kiểm tra
echo "[6/6] Kiểm tra..."
pm2 status
sleep 3
curl -f http://localhost:6868/api-docs > /dev/null && echo "OK: main-service" || echo "FAIL: main-service"

echo "=========================================="
echo "  Deploy hoàn tất!"
echo "=========================================="
DEPLOYSCRIPT

chmod +x /root/ocj/deploy-hybrid.sh
```

---

## 13. Troubleshooting

### Vấn đề: Worker không nhận job từ queue

**Nguyên nhân**: Redis không kết nối được.

**Kiểm tra**:

```bash
# Kiểm tra Redis Docker đang chạy
docker compose ps redis

# Kiểm tra worker log
pm2 logs worker-service

# Kiểm tra kết nối Redis từ host
redis-cli -h localhost -p 6379 ping
```

**Fix**: Đảm bảo `REDIS_HOST=localhost` trong cả 2 file `.env`.

---

### Vấn đề: Judge0 trả về lỗi 13 (Internal Error) khi chấm bài

**Nguyên nhân**: Judge0 sandbox (isolate/cgroup) không hoạt động do thiếu `privileged` mode hoặc do chạy trong container lồng container.

**Kiểm tra**:

```bash
docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml logs workers
# Nếu thấy "Failed to create control group" hoặc "Error 13"
```

**Fix**: 
- Hybrid deploy (cách này) đã giải quyết vấn đề này vì Judge0 chạy `privileged: true` trong container riêng.
- Nếu vẫn lỗi, kiểm tra `cgroup v2` trên VPS:

```bash
# Kiểm tra cgroup version
stat -fc %T /sys/fs/cgroup/
# Nếu là cgroup2fs, có thể cần mount thêm:
mount | grep cgroup
```

---

### Vấn đề: main-service không kết nối được MySQL

**Kiểm tra**:

```bash
docker compose logs mysql
nc -zv localhost 3307
```

**Fix**: Đảm bảo `DATABASE_URL` trỏ đến `localhost:3307` (không phải `mysql:3306`).

---

### Vấn đề: PM2 restart loop

**Kiểm tra**:

```bash
pm2 logs main-service --lines 50
```

Thường do lỗi kết nối database khi khởi động. Kiểm tra database đã sẵn sàng chưa.

---

## 14. Lệnh Thường Dùng

```bash
# Docker infra
docker compose ps                              # Kiểm tra container
docker compose logs -f mysql                   # Xem log MySQL
docker compose restart redis                   # Restart Redis

# Judge0
docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml logs -f server

# PM2
pm2 status                                     # Trạng thái services
pm2 logs main-service                          # Log main-service
pm2 logs worker-service                        # Log worker-service
pm2 restart main-service                       # Restart main-service
pm2 restart worker-service                     # Restart worker-service
pm2 stop all                                   # Dừng tất cả

# Deploy code mới
./deploy-hybrid.sh
```
