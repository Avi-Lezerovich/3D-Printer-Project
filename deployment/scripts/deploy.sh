#!/bin/bash

# 3D Printer Project Deployment Script
echo "🚀 Starting deployment..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build and deploy using Docker Compose
echo "📦 Building and starting containers..."
cd deployment/docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"

# Show running containers
echo ""
echo "🐳 Running containers:"
docker-compose ps