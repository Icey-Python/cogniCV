#!/bin/bash

# Ps. Script has to be in the project root directory
# Root path of the repository
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Parent directory where the apps are deployed (matching existing logic)
DEPLOY_ROOT="$(cd "$REPO_ROOT/.." && pwd)"

deploy_frontend() {
  echo "🚀 Deploying Frontend..."
  cd "$DEPLOY_ROOT" || { echo "Failed to enter $DEPLOY_ROOT"; exit 1; }
  
  # Remove old build, copy fresh files
  rm -rf client
  cp -r "$REPO_ROOT/client" ./
  cp .env.local ./client/ 2>/dev/null || echo "Warning: .env.local not found in $DEPLOY_ROOT"
  
  cd client || exit
  pnpm install
  pnpm run build
  
  # Restart PM2 process
  pm2 delete cognicv-frontend 2>/dev/null || true
  pnpm run deploy
  
  pm2 save
  echo "✅ Frontend deployed successfully!"
}

deploy_backend() {
  echo "🚀 Deploying Backend..."
  cd "$DEPLOY_ROOT" || { echo "Failed to enter $DEPLOY_ROOT"; exit 1; }
  
  # Remove old build, copy fresh files
  rm -rf server
  cp -r "$REPO_ROOT/server" ./
  cp .env.server ./server/.env 2>/dev/null || echo "Warning: .env.server not found in $DEPLOY_ROOT"
  
  cd server || exit
  pnpm install
  pnpm run build
  
  # Restart PM2 process
  pm2 delete cognicv-backend 2>/dev/null || true
  pnpm run deploy
  
  pm2 save
  echo "✅ Backend deployed successfully!"
}

# Simple selection menu
echo "What app are you updating?"
echo "1: client"
echo "2: server"
echo "3: All apps"
read -p "Enter app number: " site

case $site in
  1)
    deploy_frontend
    ;;
  2)
    deploy_backend
    ;;
  3)
    deploy_backend
    deploy_frontend
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo "Done!"
