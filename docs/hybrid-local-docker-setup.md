# Hybrid Local + Docker Setup

Tai lieu nay huong dan cach chay OCJ theo mo hinh hybrid:

- `apps/frontend` chay local.
- `apps/main-service` chay local.
- `apps/worker-service` chay local.
- `mysql`, `mongodb`, `redis` chay bang Docker Compose root.
- `judge0` chay bang Docker Compose rieng trong `judge0-server/judge0-v1.13.0`.

Muc tieu cua setup nay la giu vong lap dev nhanh tren may local, nhung van de cac dependency ha tang trong container.

## 1. Prerequisites

Can co san:

- Node.js tuong thich voi workspace hien tai.
- npm `10.9.2` theo root `package.json`.
- Docker Desktop + Docker Compose.

Repo da duoc neo `turbo` ve dung version:

```text
2.0.0
```

Neu can kiem tra nhanh:

```powershell
npx turbo --version
```

## 2. Cai dependencies

Chay o root repo:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge'
npm install
```

## 3. Tao env cho Docker infra

Tao `.env.docker` tu file mau:

```powershell
Copy-Item .env.docker.example .env.docker
```

Mac dinh file mau da phu hop voi setup hybrid nay:

- MySQL expose ra `localhost:3307`
- MongoDB expose ra `localhost:27017`
- Redis expose ra `localhost:6379`

Neu ban giu nguyen gia tri mac dinh trong `.env.docker`, local services co the dung lai bo port nay.

## 4. Khoi dong infra bang Docker

### 4.1. Khoi dong MySQL, MongoDB, Redis

```powershell
docker compose up -d mysql mongodb redis
```

### 4.2. Khoi dong Judge0 self-host

Judge0 khong nam trong root `docker-compose.yml`, ma nam o file compose rieng:

```powershell
docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml up -d
```

Judge0 se expose API o:

```text
http://localhost:2358
```

Luu y: Judge0 compose nay co Redis/Postgres rieng cua no. Redis nay la noi bo cho Judge0, khong phai Redis ma app dung cho BullMQ/PubSub.

## 5. Tao env local cho cac app

### 5.1. `apps/main-service/.env`

Tao file `apps/main-service/.env` voi noi dung goi y sau:

```dotenv
PORT=6868
DATABASE_URL="mysql://root:ocj_root_secret@localhost:3307/ocj_main_db"
MONGO_URI="mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_ACCESS_SECRET="your_jwt_access_secret_here"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_here"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_password"
GEMINI_API_KEY=""
RAPIDAPI_KEY=""
RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"
JUDGE0_URL="http://localhost:2358"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 5.2. `apps/worker-service/.env`

Tao file `apps/worker-service/.env` voi noi dung toi thieu:

```dotenv
MONGO_URI="mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin"
REDIS_HOST="localhost"
REDIS_PORT=6379
RAPIDAPI_KEY=""
RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"
JUDGE0_URL="http://localhost:2358"
```

### 5.3. `apps/frontend/.env.local` (tuy chon)

Frontend hien co default URL hop le cho local dev. Tuy vay, de ro rang hon ban co the tao them `apps/frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:6868/api/v1
VITE_SOCKET_URL=http://localhost:6868
```

## 6. Dong bo schema MySQL

Chay trong `apps/main-service`:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge\apps\main-service'
npm run db:push
```

### 6.1. Seed data mau

Repo hien co script seed tai `apps/main-service/src/scripts/seed.ts`.

Luu y rat quan trong:

- Script nay co xoa du lieu hien co trong mot loat bang MySQL va collection MongoDB lien quan truoc khi seed lai.
- Day la script phu hop cho local/dev, khong nen chay tren moi truong dang co data that.

Trinh tu khuyen nghi:

1. Dam bao MySQL, MongoDB, Redis va Judge0 da chay.
2. Dam bao da tao `apps/main-service/.env` dung voi local Docker ports.
3. Chay `npm run db:push` truoc de dong bo schema MySQL.
4. Sau do moi chay script seed.

Lenh chay seed:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge\apps\main-service'
npm run seed
```

Hoac chay truc tiep tu root repo:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge'
npm run seed
```

Neu seed thanh cong, terminal se in ra log ket thuc dang:

```text
Seeding completed successfully!
```

Script seed hien tai tao cac nhom data mau sau:

- Users: `admin`, `tester`, `luffy`, `naruto`, `sasuke`
- Mat khau mac dinh cho cac user: `password123`
- Friendships: mot so quan he ban be va request cho tinh nang social
- Shop items: item avatar frame va theme
- Tags: dynamic programming, greedy, math
- Problems: it nhat cac bai `two-sum` va `fibonacci`
- Testcases: example va hidden testcase cho cac bai tren
- Contest: 1 contest dang dien ra va registrations mau
- Comments: thread thao luan mau tren problem
- Reports: report mau cho admin/moderation

Sau khi seed, ban co the dang nhap nhanh bang cac tai khoan mau, vi du:

- Admin: `admin@example.com` / `password123`
- User: `tester@example.com` / `password123`

Neu muon seed lai tu dau, chi can chay lai lenh tren. Script se cleanup data lien quan roi tao lai bo mau moi.

## 7. Chay 3 app local

Co 2 cach.

### Cach A: Chay tu root bang Turbo

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge'
npm run dev
```

Lenh nay se dung `turbo run dev` de chay cac app co script `dev`, bao gom:

- `frontend`
- `main-service`
- `worker-service`

### Cach B: Chay tung service o 3 terminal rieng

Terminal 1:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge\apps\frontend'
npm run dev
```

Terminal 2:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge\apps\main-service'
npm run dev
```

Terminal 3:

```powershell
Set-Location 'D:\.Learn\Fessior\online-code-judge\apps\worker-service'
npm run dev
```

## 8. URLs can verify sau khi chay

- Frontend Vite: `http://localhost:5173`
- Main API: `http://localhost:6868`
- Swagger: `http://localhost:6868/api-docs`
- Judge0: `http://localhost:2358`
- MySQL: `localhost:3307`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## 9. Checklist neu gap loi

### Turbo khong chay dung

```powershell
npx turbo --version
```

Ky vong:

```text
2.0.0
```

Neu van loi cache cu, thu xoa thu muc `.turbo` roi chay lai:

```powershell
Remove-Item -Recurse -Force .turbo
npm install
npm run dev
```

### Main-service khong noi duoc MySQL

Kiem tra lai `DATABASE_URL` phai tro ve `localhost:3307`, khong phai host Docker `mysql`.

### Main-service/worker-service khong noi duoc MongoDB

Kiem tra:

- Docker MongoDB dang chay.
- `MONGO_URI` dung `localhost:27017`.
- Co `authSource=admin`.

### Worker khong an job

Kiem tra:

- Redis dang chay o `localhost:6379`.
- `REDIS_HOST` trong ca `main-service` va `worker-service` deu la `localhost`.
- Worker terminal co log `Submission Queue Worker started successfully`.

### Judge0 tra loi loi hoac timeout

Kiem tra:

- Judge0 compose da duoc bat.
- `JUDGE0_URL` la `http://localhost:2358`.
- Khong can `RAPIDAPI_KEY` neu ban dang dung Judge0 self-host.

## 10. Dung stack

Dung local dev app: nhan `Ctrl + C` o terminal local.

Dung infra Docker root:

```powershell
docker compose stop mysql mongodb redis
```

Dung Judge0:

```powershell
docker compose -f judge0-server/judge0-v1.13.0/docker-compose.yml down
```

Neu muon xoa han container root infra:

```powershell
docker compose down
```
