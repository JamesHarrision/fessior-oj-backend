# Testing

Repo co test o main-service, worker-service va frontend.

## Root Test

Chay tu root:

```bash
npm run test
```

Root script dung Turborepo:

```bash
turbo run test
```

## Main Service Tests

Main-service dung Jest, ts-jest va Supertest.

Chay tat ca test:

```bash
cd apps/main-service
npm run test
```

Script:

```json
{
  "test": "jest --runInBand"
}
```

Test files:

```text
apps/main-service/src/tests/
  ai.test.ts
  auth.test.ts
  comment.test.ts
  contest.test.ts
  friendship.test.ts
  leaderboard.test.ts
  notification.test.ts
  problem.test.ts
  report.test.ts
  room.test.ts
  setup.ts
  shop.test.ts
  submission.test.ts
```

Chay mot suite:

```bash
npm run test src/tests/auth.test.ts
```

## Frontend Tests

Frontend dung Vitest va Testing Library.

Chay:

```bash
cd apps/frontend
npm run test
```

Script:

```json
{
  "test": "vitest run"
}
```

Files lien quan:

```text
apps/frontend/src/test/setup.ts
apps/frontend/src/components/layout/Navbar.test.tsx
```

## Worker Tests

Worker co end-to-end test file:

```text
apps/worker-service/src/tests/test_judge0_end_to_end.ts
```

File nay khoi dong worker va add job vao `submission_queue`, phu thuoc Redis/MongoDB/Judge0/env. Khi chay can dam bao infra va env da san sang.

## Test Dependencies

Test backend co the can:

- MySQL running neu test cham Prisma.
- MongoDB running neu test cham Mongoose models.
- Redis running neu test cham queue/socket.
- Env JWT secrets.
- Mock hoac API key neu test cham external services.

## Suggested Test Order For Dev

1. Chay unit/integration test main-service:

   ```bash
   cd apps/main-service
   npm run test
   ```

2. Chay frontend test:

   ```bash
   cd apps/frontend
   npm run test
   ```

3. Chay worker E2E khi can verify queue/Judge0:

   ```bash
   cd apps/worker-service
   npx tsx src/tests/test_judge0_end_to_end.ts
   ```

## Coverage Gaps To Watch

- Cross-database consistency MySQL/MongoDB.
- Queue retry/recovery khi worker fail giua chung.
- Socket matchmaking khi multi-instance.
- Judge0 timeout/error mapping.
- Ban user behavior tren Socket.io.
