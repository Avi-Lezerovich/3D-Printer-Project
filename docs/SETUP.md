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

## 🔍 Debugging and Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clean and rebuild
   npm run clean --workspace=shared
   npm run build
   ```

2. **Port Conflicts**:
   ```bash
   # Check what's running on ports
   lsof -i :3000  # Backend port
   lsof -i :5173  # Frontend port
   ```

3. **Dependencies Issues**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm run install:all
   ```

### Debug Mode

```bash
# Backend with debug logging
DEBUG=app:* npm run dev:backend

# Frontend with verbose logging
VITE_DEBUG=true npm run dev:frontend
```

### Logs Location

- **Development**: Console output
- **Production**: `/var/log/3d-printer-app/`
- **Docker**: `docker compose logs`

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