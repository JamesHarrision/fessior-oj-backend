# OCJ Documentation

Thu muc nay tong hop tai lieu ky thuat cho du an Online Code Judge (OCJ), duoc viet lai dua tren source hien tai cua monorepo.

## Danh muc tai lieu

| File | Noi dung |
| --- | --- |
| [project-structure.md](project-structure.md) | Cau truc monorepo, vai tro tung app/package. |
| [architecture.md](architecture.md) | Kien truc tong quan va cac thanh phan he thong. |
| [feature-flows.md](feature-flows.md) | Cac luong chuc nang chinh, so do va file lien quan. |
| [database-mysql-prisma-erd.md](database-mysql-prisma-erd.md) | ERD MySQL/Prisma va giai thich cac bang chinh. |
| [database-mongodb.md](database-mongodb.md) | Schema MongoDB/Mongoose cho Problem, Testcase, Submission. |
| [database-boundaries.md](database-boundaries.md) | Ranh gioi du lieu MySQL vs MongoDB va cac lien ket cross-database. |
| [api-overview.md](api-overview.md) | Tong quan REST API modules va route prefix. |
| [submission-flow.md](submission-flow.md) | Luong nop bai, queue BullMQ, worker cham bai va realtime update. |
| [realtime-and-matchmaking.md](realtime-and-matchmaking.md) | Socket.io events, matchmaking, custom room, Redis Pub/Sub. |
| [auth-and-permissions.md](auth-and-permissions.md) | Authentication, refresh token, session revoke, role/permission. |
| [development-setup.md](development-setup.md) | Huong dan chay local/dev. |
| [hybrid-local-docker-setup.md](hybrid-local-docker-setup.md) | Huong dan hybrid: FE/main-service/worker-service chay local, MySQL/MongoDB/Redis/Judge0 chay Docker. |
| [testing.md](testing.md) | Cau truc va cach chay test. |
| [deployment.md](deployment.md) | Docker Compose, VPS scripts, env va cac luu y trien khai. |
| [ai-agent-docs-rules.md](ai-agent-docs-rules.md) | Rule cho AI agent: moi thay doi repo phai sync docs. |

## Source chinh

- Prisma schema: `apps/main-service/prisma/schema.prisma`
- Mongoose models: `apps/main-service/src/models/*`, `apps/worker-service/src/models/*`
- API routes: `apps/main-service/src/routes/*`
- Socket flow: `apps/main-service/src/sockets/*`
- Worker flow: `apps/worker-service/src/workers/submission.worker.ts`
- Shared constants: `packages/constants/src/index.ts`
