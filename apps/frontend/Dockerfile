FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN npm install --no-audit --no-fund

COPY apps/frontend/ ./apps/frontend/

EXPOSE 5173

CMD ["npm", "--workspace", "frontend", "run", "dev", "--", "--host", "0.0.0.0"]
