# Feature Flows

This file lists the main flows worth learning and explaining. The project is intentionally trimmed to a focused resume-friendly scope.

## 1. Authentication And Session

Users register/login, receive access + refresh tokens, and can revoke sessions.

```mermaid
flowchart LR
  FE[Auth UI] --> API[auth.route]
  API --> Validator[auth.validator]
  Validator --> Controller[auth.controller]
  Controller --> Service[auth.service]
  Service --> Repo[auth.repository]
  Repo --> MySQL[(users / refresh_tokens / password_reset_tokens)]
  Service --> JWT[jwt.util]
  Service --> Password[password.util]
```

Key files:

- `apps/main-service/src/routes/auth.route.ts`
- `apps/main-service/src/controllers/auth.controller.ts`
- `apps/main-service/src/services/auth.service.ts`
- `apps/main-service/src/repositories/auth.repository.ts`
- `apps/main-service/src/middlewares/auth.middleware.ts`

## 2. Problem And Testcase Management

Problems, tags, starter code, limits, and testcases are stored in MySQL through Prisma.

```mermaid
flowchart LR
  FE[Problem/Admin UI] --> API[problem.route]
  API --> Validator[problem.validator]
  Validator --> Controller[problem.controller]
  Controller --> Service[problem.service]
  Service --> Repo[problem.repository]
  Repo --> MySQL[(problems / testcases / tags / problem_tags)]
```

Key files:

- `apps/main-service/src/routes/problem.route.ts`
- `apps/main-service/src/controllers/problem.controller.ts`
- `apps/main-service/src/services/problem.service.ts`
- `apps/main-service/src/repositories/problem.repository.ts`
- `apps/main-service/src/validators/problem.validator.ts`
- `apps/main-service/prisma/schema.prisma`

## 3. Submit Code And Judge

Main-service creates a MySQL submission, queues a BullMQ job, and worker-service evaluates testcases asynchronously.

```mermaid
flowchart LR
  FE[Editor / Submit UI] --> API[submission.route]
  API --> Controller[submission.controller]
  Controller --> Service[submission.service]
  Service --> MySQL[(submissions)]
  Service --> Queue[BullMQ submission_queue]
  Queue --> Worker[worker-service]
  Worker --> MySQL2[(problems / testcases / submissions)]
  Worker --> Executor["@ocj/executor / Judge0"]
  Worker --> PubSub[Redis submission-updates]
  PubSub --> Socket[main-service socket subscriber]
```

Key files:

- `apps/main-service/src/routes/submission.route.ts`
- `apps/main-service/src/controllers/submission.controller.ts`
- `apps/main-service/src/services/submission.service.ts`
- `apps/main-service/src/config/queue.ts`
- `apps/worker-service/src/workers/submission.worker.ts`
- `packages/executor/src/index.ts`

## 4. Realtime Matchmaking 1v1

Users join a Socket.io matchmaking queue. Main-service pairs close-ELO users, selects a MySQL problem, creates a match, and emits realtime match events.

```mermaid
flowchart LR
  FE[Match Finding UI] --> SocketClient[frontend socket service]
  SocketClient --> SocketServer[main-service Socket.io]
  SocketServer --> Queue[In-memory matchmakingQueue]
  Queue --> MySQL[(problems / matches / users)]
  MySQL --> Room["match:{matchId}"]
  Room --> FE
  JudgeUpdate[submission-updates] --> EndMatch[endMatch]
  EndMatch --> Elo[Update ELO / streak]
  EndMatch --> Emit[match-ended]
```

Key files:

- `apps/main-service/src/sockets/socket.ts`
- `apps/main-service/src/sockets/matchmaking.ts`
- `apps/main-service/src/routes/match_history.route.ts`
- `apps/main-service/src/services/match_history.service.ts`
- `packages/utils/src/index.ts`

## 5. Custom Rooms

Users create rooms, join by code, ready up, and start a multiplayer match. Room state is persisted in MySQL and synchronized by Socket.io.

```mermaid
flowchart LR
  FE[Custom Rooms UI] --> API[room.route]
  API --> Controller[room.controller]
  Controller --> Service[room.service]
  Service --> Repo[room.repository]
  Repo --> MySQL[(custom_rooms / participants / matches)]
  FE <-->|custom-room events| Socket[Socket.io]
```

Key files:

- `apps/main-service/src/routes/room.route.ts`
- `apps/main-service/src/controllers/room.controller.ts`
- `apps/main-service/src/services/room.service.ts`
- `apps/main-service/src/repositories/room.repository.ts`
- `apps/main-service/src/sockets/socket.ts`

## 6. Comments And Discussions

Users can create, reply, update, delete, and like comments attached to a target such as a problem.

```mermaid
flowchart LR
  FE[Problem Comments UI] --> API[comment.route]
  API --> Controller[comment.controller]
  Controller --> Service[comment.service]
  Service --> Repo[comment.repository]
  Repo --> MySQL[(comments / comment_likes)]
```

Key files:

- `apps/main-service/src/routes/comment.route.ts`
- `apps/main-service/src/controllers/comment.controller.ts`
- `apps/main-service/src/services/comment.service.ts`
- `apps/main-service/src/repositories/comment.repository.ts`

## 7. Leaderboard And User Stats

Leaderboard/profile data comes from users, ELO histories, activities, tag stats, and MySQL submissions.

```mermaid
flowchart LR
  FE[Ranking / Profile UI] --> API[leaderboard + user routes]
  API --> Service[leaderboard.service / user.service]
  Service --> Repo[user.repository]
  Repo --> MySQL[(users / submissions / stats)]
```

Key files:

- `apps/main-service/src/routes/leaderboard.route.ts`
- `apps/main-service/src/services/leaderboard.service.ts`
- `apps/main-service/src/routes/user.route.ts`
- `apps/main-service/src/services/user.service.ts`
- `apps/main-service/src/repositories/user.repository.ts`

## 8. Chatbox

The remaining AI-related surface is a lightweight in-memory chatbox: list sessions and send messages to a session id. It can use Gemini when configured and should stay separate from judge verdict logic.

```mermaid
flowchart LR
  FE[Chatbox UI] --> API[chat.route]
  API --> Controller[chat.controller]
  Controller --> Service[chat.service]
  Service --> Gemini[Optional Gemini API]
```

Key files:

- `apps/main-service/src/routes/chat.route.ts`
- `apps/main-service/src/controllers/chat.controller.ts`

## Removed From Current Learning Scope

The previous contest, social/friendship, shop, notification, report/moderation, AI roadmap/debug, news, and mock interview flows are no longer part of the active product surface.
