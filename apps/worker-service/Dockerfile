FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and lockfiles
COPY package*.json ./
COPY turbo.json ./

# Copy package descriptors for workspaces to cache layers
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/types/package.json ./packages/types/
COPY packages/errors/package.json ./packages/errors/
COPY apps/main-service/package.json ./apps/main-service/
COPY apps/worker-service/package.json ./apps/worker-service/

# Install all monorepo dependencies
RUN npm ci

# Copy workspace source files
COPY packages/ ./packages/
COPY apps/worker-service/ ./apps/worker-service/

# Build worker-service and dependencies via turbo
RUN npm run build -- --filter=worker-service...

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy files required to start the workspace
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker-service/package.json ./apps/worker-service/package.json
COPY --from=builder /app/apps/worker-service/dist ./apps/worker-service/dist

# Launch worker-service
WORKDIR /app/apps/worker-service
CMD npm run start
