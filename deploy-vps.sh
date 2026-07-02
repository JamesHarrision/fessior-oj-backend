#!/bin/bash
# Exit on error
set -e

echo "=========================================="
echo "🚀 STARTING AUTOMATED DEPLOYMENT ON VPS..."
echo "=========================================="

# 1. Pull latest code from current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📥 Pulling latest changes from branch: $CURRENT_BRANCH..."
git fetch --all
git reset --hard origin/$CURRENT_BRANCH

# 2. Build main-service and worker-service without cache to prevent any sync issues
echo "🐳 Rebuilding Docker containers..."
docker compose build --no-cache main-service worker-service

# 3. Restart the containers
echo "🔄 Restarting containers..."
docker compose down
docker compose up -d

echo "✅ DEPLOYMENT COMPLETED SUCCESSFULY!"
echo "------------------------------------------"
echo "📊 Current container status:"
docker compose ps
