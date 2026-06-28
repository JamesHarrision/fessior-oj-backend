FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and lockfiles
COPY package*.json ./
COPY turbo.json ./

# Copy package descriptors for workspaces to cache layers
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/types/package.json ./packages/types/
COPY packages/errors/package.json ./packages/errors/
COPY packages/constants/package.json ./packages/constants/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validators/package.json ./packages/validators/
COPY packages/executor/package.json ./packages/executor/
COPY apps/main-service/package.json ./apps/main-service/
COPY apps/worker-service/package.json ./apps/worker-service/

# Install all monorepo dependencies
RUN npm ci

# Copy workspace source files
COPY packages/ ./packages/
COPY apps/main-service/ ./apps/main-service/

# Generate Prisma client for schema operations
WORKDIR /app/apps/main-service
RUN npx prisma generate

# Build main-service and dependencies via turbo
WORKDIR /app
RUN npm run build -- --filter=main-service...

# Runner stage
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app


# Copy files required to start the workspace
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/main-service/package.json ./apps/main-service/package.json
COPY --from=builder /app/apps/main-service/dist ./apps/main-service/dist
COPY --from=builder /app/apps/main-service/prisma ./apps/main-service/prisma


EXPOSE 6868

# Auto run database push to synchronize schemas, then launch main-service
WORKDIR /app/apps/main-service
CMD npx prisma db push && npm run start
