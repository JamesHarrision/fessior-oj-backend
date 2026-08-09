# Development Setup

Tai lieu nay huong dan chay OCJ o local/dev.

## Requirements

- Node.js compatible voi npm workspace hien tai.
- npm `10.9.2` theo `packageManager` trong root `package.json`.
- Docker va Docker Compose neu chay MySQL/MongoDB/Redis bang container.

## Install Dependencies

Chay tu root repo:

```bash
npm install
```

Root workspace gom:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

## Environment

Docker Compose dung default env tu:

```text
.env.docker.example
```

Neu can override secrets/local config, tao them:

```text
.env.docker
```

Bang cach copy tu file mau:

```bash
cp .env.docker.example .env.docker
```

Voi setup hybrid mac dinh, neu chua tao `.env` rieng cho app, code se dung default local dev:

```text
DATABASE_URL=mysql://root:ocj_root_secret@localhost:3307/ocj_main_db
MONGO_URI=mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
```

Default nay nam trong `apps/main-service/src/config/env.ts` va `apps/worker-service/src/config/env.ts`. Tao `.env` trong tung app neu can override.

Main service local dev can env rieng trong:

```text
apps/main-service/.env
```

Worker service local dev can env rieng trong:

```text
apps/worker-service/.env
```

Tao tu file mau:

```bash
cp apps/worker-service/.env.example apps/worker-service/.env
```

Bien moi truong quan trong:

| Env | Muc dich |
| --- | --- |
| `DATABASE_URL` | MySQL connection string cho Prisma. |
| `MONGO_URI` | MongoDB connection string. |
| `REDIS_HOST` | Redis host. |
| `REDIS_PORT` | Redis port. |
| `JWT_ACCESS_SECRET` | Secret ky access token. |
| `JWT_REFRESH_SECRET` | Secret ky refresh token. |
| `RAPIDAPI_KEY` | Judge0 RapidAPI key neu dung RapidAPI. |
| `RAPIDAPI_HOST` | Judge0 RapidAPI host. |
| `JUDGE0_URL` | Judge0 endpoint override. |
| `GEMINI_API_KEY` | Google Gemini API key. |
| `CLOUDINARY_*` | Cloudinary upload config. |

## Run Infrastructure Only

Chay database/queue cho local dev:

```bash
docker compose up -d mysql mongodb redis
```

Ports mac dinh trong `docker-compose.yml`:

```text
MySQL:   localhost:3307 -> container 3306
MongoDB: localhost:27017
Redis:   localhost:6379
```

## Root Dev Scripts

Tu root repo, cac script dev chinh la:

| Script | Muc dich |
| --- | --- |
| `npm run dev` | Mac dinh chay hybrid: bat MySQL, MongoDB, Redis bang Docker, sau do chay frontend/main-service/worker-service local qua Turbo. |
| `npm run dev:hybrid` | Giong `npm run dev`, dung cho vong lap dev hang ngay. |
| `npm run dev:local` | Generate Prisma client, build shared packages, roi chay dev server local cho `frontend`, `main-service`, `worker-service`; dung khi infra da duoc bat san. |
| `npm run dev:prepare` | Chay rieng buoc chuan bi: `prisma generate` va build cac package `@ocj/*` can `dist`; build package chi in log khi co loi. |
| `npm run dev:apps` | Chi chay 3 dev server local, khong prepare va khong bat Docker. |
| `npm run dev:docker` | Chay full Docker Compose stack: frontend, main-service, worker-service, MySQL, MongoDB va Redis. |

Luu y: `dev` va `dev:hybrid` can Docker dang chay. Neu chua co `.env.docker`, Docker Compose se dung `.env.docker.example` lam default cho local/dev.

## Prisma

Chay trong `apps/main-service`:

```bash
npm run db:push
```

Mo Prisma Studio:

```bash
npm run db:studio
```

Prisma schema:

```text
apps/main-service/prisma/schema.prisma
```

## Seed Data

Sau khi da co `apps/main-service/.env` dung va database local da chay, co the seed du lieu mau tu root repo:

```bash
npm run seed
```

Lenh root nay se forward sang workspace `main-service` de chay file:

```text
apps/main-service/src/scripts/seed.ts
```

Luu y:

- Script seed se xoa mot so data hien co trong MySQL va MongoDB truoc khi tao lai bo du lieu mau.
- Nen chay `npm run db:push` trong `apps/main-service` truoc khi seed neu schema MySQL vua thay doi.
- Chi dung cho local/dev, khong dung tren moi truong co data that.

## Run All Dev Services

Chay tu root theo setup hybrid mac dinh:

```bash
npm run dev
```

Script nay goi:

```bash
docker compose up -d --wait --wait-timeout 120 mysql mongodb redis
npm run dev:prepare
npm run dev:apps
```

Neu MySQL/MongoDB/Redis da chay san va chi muon start cac app local:

```bash
npm run dev:local
```

Neu vua clone repo va muon kiem tra buoc chuan bi truoc khi chay server:

```bash
npm run dev:prepare
```

Neu muon chay toan bo stack trong Docker:

```bash
npm run dev:docker
```

## Run Services Separately

Main API:

```bash
cd apps/main-service
npm run dev
```

Worker:

```bash
cd apps/worker-service
npm run dev
```

Frontend:

```bash
cd apps/frontend
npm run dev
```

## API URLs

Mac dinh main-service listen:

```text
http://localhost:6868
```

Swagger UI:

```text
http://localhost:6868/api-docs
```

Frontend Vite listen:

```text
http://localhost:5173
```

## Build

Build all workspaces:

```bash
npm run build
```

Build tung app:

```bash
cd apps/main-service && npm run build
cd apps/worker-service && npm run build
cd apps/frontend && npm run build
```

## Lint And Format

Root scripts:

```bash
npm run lint
npm run format
```

`format` se format cac file:

```text
**/*.{ts,tsx,md}
```
