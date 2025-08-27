# Setup and Deployment Guide

This guide provides comprehensive instructions for setting up, running, and deploying the 3D Printer Project in development and production environments.

## 📋 Prerequisites

### System Requirements

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version
- **Docker**: v20+ (for containerized deployment)
- **Docker Compose**: v2+ (for multi-container setup)

### Development Tools (Recommended)

- **VS Code**: With TypeScript, ESLint, and Prettier extensions
- **Postman**: For API testing
- **Docker Desktop**: For container management

## 🚀 Quick Start (Development)

### 1. Clone Repository

```bash
git clone https://github.com/Avi-Lezerovich/3D-Printer-Project.git
cd 3D-Printer-Project
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm run install:all

# Or step by step:
npm install
npm install --workspace=shared
npm install --workspace=backend  
npm install --workspace=frontend
```

### 3. Environment Setup

Create environment files from templates:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment (if needed)
cp frontend/.env.example frontend/.env
```

### 4. Build Shared Package

```bash
npm run build:shared
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:frontend  # Runs on http://localhost:5173
npm run dev:backend   # Runs on http://localhost:3000
```

### 6. Verify Setup

- **Frontend**: Open http://localhost:5173
- **Backend API**: Open http://localhost:3000/api/v1/docs
- **Health Check**: GET http://localhost:3000/api/health

## 🏗️ Development Workflow

### File Structure Overview

```
3D-Printer-Project/
├── 📁 shared/              # Shared types and utilities
│   ├── src/types/         # API contracts, domain models
│   └── package.json       # Shared dependencies
│
├── 📁 frontend/           # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-specific modules
│   │   ├── pages/         # Route components
│   │   ├── services/      # API clients, utilities
│   │   └── styles/        # Global styles, themes
│   └── package.json
│
├── 📁 backend/            # Node.js API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Configuration management
│   └── package.json
│
├── 📁 docs/               # Project documentation
├── 📁 deployment/         # Docker, CI/CD configs
└── package.json           # Root workspace configuration
```

### Making Changes

1. **Feature Development**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Make changes...
   
   # Run tests and linting
   npm run lint
   npm run test
   npm run build
   ```

2. **Code Quality**:
   ```bash
   # Format code
   npm run format
   
   # Type checking (frontend)
   npm run typecheck --workspace=frontend
   
   # Run specific tests
   npm run test:watch --workspace=frontend
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build all packages for production |
| `npm run test` | Run all tests |
| `npm run lint` | Run ESLint on all packages |
| `npm run format` | Format code with Prettier |
| `npm run install:all` | Install dependencies for all workspaces |

## 🐳 Docker Development Setup

### Local Development with Docker

```bash
# Build and start all services
npm run deploy:local:build
npm run deploy:local:up

# View logs
npm run deploy:local:logs

# Stop services
npm run deploy:local:down
```

### Services Available

- **Frontend**: http://localhost:3000 (served by backend in production mode)
- **Backend API**: http://localhost:3000/api/v1
- **Database**: PostgreSQL on port 5432 (internal)
- **Redis**: Redis on port 6379 (internal)

### Docker Environment Variables

Create `deployment/docker/.env`:

```env
# Database
POSTGRES_DB=printer_db
POSTGRES_USER=printer_user
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_PASSWORD=redis_password

# Backend
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
SERVE_FRONTEND=true
```

## 🚢 Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Prepare Production Environment**:
   ```bash
   # Clone repository on server
   git clone https://github.com/Avi-Lezerovich/3D-Printer-Project.git
   cd 3D-Printer-Project
   ```

2. **Configure Environment**:
   ```bash
   # Copy and edit environment file
   cp deployment/docker/.env.example deployment/docker/.env
   nano deployment/docker/.env
   ```

3. **Deploy**:
   ```bash
   # Build and start production services
   docker compose -f deployment/docker/docker-compose.yml up -d --build
   ```

4. **Verify Deployment**:
   ```bash
   # Check service status
   docker compose -f deployment/docker/docker-compose.yml ps
   
   # View logs
   docker compose -f deployment/docker/docker-compose.yml logs -f
   ```

### Option 2: Manual Deployment

1. **Build Application**:
   ```bash
   # Install production dependencies
   npm ci --only=production
   
   # Build all packages
   npm run build
   ```

2. **Setup Database**:
   ```bash
   # Setup PostgreSQL database
   # Setup Redis instance
   
   # Run database migrations (if applicable)
   npm run db:migrate --workspace=backend
   ```

3. **Start Application**:
   ```bash
   # Start backend server
   NODE_ENV=production npm run start --workspace=backend
   ```

### Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend (static files)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🔧 Configuration

### Backend Configuration

Environment variables in `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/printer_db

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CSRF_SECRET=your-csrf-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional-password

# Features
SERVE_FRONTEND=false
ENABLE_SWAGGER=true
ENABLE_METRICS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

Environment variables in `frontend/.env`:

```env
# API Configuration
VITE_API_BASE=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# Features
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ANALYTICS=false

# Environment
VITE_NODE_ENV=development
```

## 🧪 Testing Setup

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch --workspace=frontend
npm run test:watch --workspace=backend
```

### Test Structure

- **Unit Tests**: Component and function level testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Full workflow testing

### Adding New Tests

1. **Frontend Tests** (React Testing Library + Vitest):
   ```typescript
   // src/components/__tests__/Button.test.tsx
   import { render, screen } from '@testing-library/react';
   import { Button } from '../Button';
   
   describe('Button', () => {
     it('renders correctly', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByText('Click me')).toBeInTheDocument();
     });
   });
   ```

2. **Backend Tests** (Supertest + Vitest):
   ```typescript
   // src/__tests__/api.test.ts
   import request from 'supertest';
   import { app } from '../app';
   
   describe('API', () => {
     it('should return health status', async () => {
       const response = await request(app).get('/api/health');
       expect(response.status).toBe(200);
     });
   });
   ```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Error: TypeScript compilation errors**
```bash
# Clean and rebuild shared package first
npm run build:shared
npm run build

# If still failing, check for missing dependencies
npm run install:all
```

**Error: Module not found errors**
```bash
# Ensure shared package is built before other packages
npm run build:shared
# Then build individual packages
npm run build:backend
npm run build:frontend
```

#### 2. Port Conflicts

**Error: Port already in use (EADDRINUSE)**
```bash
# Check what's using the ports
lsof -i :5173  # Frontend dev port
lsof -i :3000  # Backend port

# Kill processes if needed
kill -9 $(lsof -t -i :5173)
kill -9 $(lsof -t -i :3000)

# Or use different ports in your .env files
echo "PORT=3001" >> backend/.env
echo "VITE_API_BASE=http://localhost:3001" >> frontend/.env
```

#### 3. Database Connection Issues

**Error: Database connection failed**
```bash
# For SQLite (default), ensure the backend can create the database file
mkdir -p backend/data
chmod 755 backend/data

# For PostgreSQL, verify connection settings
# Check DATABASE_URL in backend/.env
```

#### 4. Docker Issues

**Error: Docker build failures**
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
npm run deploy:local:build --no-cache

# Check available resources
docker system df
```

**Error: Services won't start**
```bash
# Check service logs
docker compose -f deployment/docker/docker-compose.yml logs [service-name]

# Restart specific service
docker compose -f deployment/docker/docker-compose.yml restart backend

# Full reset
npm run deploy:local:down
docker system prune -f
npm run deploy:local:up
```

#### 5. Development Server Issues

**Error: Frontend shows API connection errors**
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check CORS configuration
# Ensure ALLOWED_ORIGINS includes http://localhost:5173
echo "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000" >> backend/.env
```

**Error: Hot reload not working**
```bash
# For Windows/WSL users
echo "CHOKIDAR_USEPOLLING=true" >> frontend/.env

# Increase file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Environment-Specific Issues

#### Windows

```powershell
# Use PowerShell for better script support
# If npm scripts fail, try running them directly:
cd frontend && npm run dev
# In another terminal:
cd backend && npm run dev
```

#### macOS

```bash
# If experiencing permission issues
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Linux

```bash
# If port binding fails
sudo setcap cap_net_bind_service=+ep $(which node)

# Or run with sudo (not recommended for development)
sudo npm run dev:backend
```

### Performance Issues

#### Slow Build Times

```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf shared/node_modules shared/package-lock.json

# Clean reinstall
npm run install:all
```

#### Memory Issues

```bash
# Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Getting Help

1. **Check logs**: Always check console output and log files
2. **Verify environment**: Ensure all required environment variables are set
3. **Test in isolation**: Try running frontend and backend separately
4. **Clean installation**: When in doubt, clean install dependencies

For additional help:
- Check the [Architecture Guide](./ARCHITECTURE.md) for system design
- Review [API Documentation](./API.md) for backend integration
- See [Testing Guide](./TESTING.md) for testing-related issues

## 🚀 Performance Optimization

### Production Checklist

- [ ] Environment variables properly set
- [ ] Static assets served with proper caching headers
- [ ] Database indexes optimized
- [ ] Redis caching enabled
- [ ] GZIP compression enabled
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup

### Monitoring

- **Health Checks**: `/api/health`
- **Metrics**: `/api/metrics` (Prometheus format)
- **Application Logs**: Structured JSON logging

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Architecture Overview](./README.md)
- [Security Guide](./SECURITY.md)
- [Testing Strategy](./TESTING.md)
- [Frontend Development Guide](../frontend/README.md)
- [Backend Development Guide](../backend/README.md)