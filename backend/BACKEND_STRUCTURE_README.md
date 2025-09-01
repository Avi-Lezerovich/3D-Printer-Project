# Backend Structure - Domain-Driven Design Implementation

This document describes the new backend architecture implementing Domain-Driven Design (DDD) principles with clean architecture patterns.

## 🏗️ Architecture Overview

The backend follows a layered architecture with clear separation of concerns:

```
backend/src/
├── app/                    # Application bootstrap and DI container
├── api/                    # HTTP API layer (controllers, routes, middleware)
├── domains/                # Business domains (auth, printer, project)
├── infrastructure/         # Infrastructure concerns (database, logging, events)
├── shared/                 # Shared interfaces, types, and utilities
└── main.ts                # Application entry point
```

## 📁 Directory Structure

### `/app` - Application Layer
Contains application bootstrapping and dependency injection setup.

- `Application.ts` - Main application class with Express setup
- `ServiceFactory.ts` - Dependency injection container for services

### `/api` - API Layer
HTTP API implementation with versioning support.

```
api/
├── common/                 # Shared API utilities
│   └── BaseController.ts   # Base controller with common HTTP patterns
├── v1/                     # API version 1
│   ├── controllers/        # HTTP request handlers
│   ├── routes/            # Express route definitions
│   └── middleware/        # API-specific middleware
└── v2/                    # Future API version
```

### `/domains` - Domain Layer
Business logic organized by domain boundaries.

```
domains/
├── auth/                   # Authentication & Authorization
│   ├── controllers/        # Auth HTTP controllers
│   ├── services/          # Auth business logic
│   │   └── auth.service.ts
│   └── repositories/      # Auth data access interfaces
├── printer/               # Printer Management
│   ├── controllers/       # Printer HTTP controllers
│   ├── services/         # Printer business logic
│   │   └── printer.service.ts
│   └── repositories/     # Printer data access interfaces
└── project/              # Project Management
    ├── controllers/
    ├── services/
    └── repositories/
```

### `/infrastructure` - Infrastructure Layer
Technical concerns and external dependencies.

```
infrastructure/
├── config/                # Configuration management
│   └── AppConfig.ts       # Centralized app configuration
├── database/             # Database-specific implementations
├── cache/                # Caching implementations
├── logging/              # Logging infrastructure
│   └── Logger.ts         # Logger interface and implementations
├── events/               # Event publishing
│   └── EventPublisher.ts # Domain event publisher
└── repositories/         # Concrete repository implementations
    ├── PrismaUserRepository.ts
    └── RepositoryFactory.ts
```

### `/shared` - Shared Layer
Common interfaces, types, and utilities used across layers.

```
shared/
├── interfaces/           # Shared interfaces
│   ├── repository.interface.ts  # Repository contracts
│   └── service.interface.ts     # Service contracts
├── types/               # Shared type definitions
│   └── domain.types.ts  # Domain models and enums
└── index.ts            # Barrel export
```

## 🔧 Key Design Patterns

### 1. Domain-Driven Design (DDD)
- **Domains** organized by business capabilities
- **Services** contain business logic
- **Repositories** abstract data access
- **Events** enable loose coupling between domains

### 2. Dependency Injection
- `RepositoryFactory` manages data access dependencies
- `ServiceFactory` manages business logic dependencies
- Constructor injection throughout the application

### 3. Repository Pattern
- `IBaseRepository<T>` provides common CRUD operations
- Domain-specific repository interfaces extend base
- Concrete implementations (e.g., `PrismaUserRepository`) handle persistence

### 4. Service Layer Pattern
- `IBaseService<T>` provides common service operations
- Business validation and logic encapsulation
- Standardized `ServiceResult<T>` return types

### 5. Event-Driven Architecture
- `EventPublisher` for domain events
- `EventHandler` interfaces for event processing
- Loose coupling between domains through events

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file with required configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/printer_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1h"
REFRESH_TOKEN_EXPIRATION="7d"

# Cache (Redis)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"

# File Storage
FILE_STORAGE_TYPE="local"
FILE_STORAGE_PATH="./uploads"
MAX_FILE_SIZE="10485760"

# Logging
LOG_LEVEL="debug"
LOG_FORMAT="console"
```

### 2. Database Setup
```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 3. Start Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📊 API Documentation

### Health Check
```
GET /health
Response: {
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development",
  "dependencies": {
    "database": true,
    "userRepository": true
  }
}
```

### API Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `/api/v1/*` - Version 1 API routes (to be implemented)

## 🧪 Testing Strategy

### Unit Tests
- Test business logic in domain services
- Mock repository dependencies
- Validate business rules and constraints

### Integration Tests
- Test repository implementations with real database
- Test API endpoints with full stack
- Validate event publishing and handling

### Example Test Structure
```typescript
describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockLogger = createMockLogger();
    authService = new AuthService(mockUserRepository, mockLogger);
  });

  it('should authenticate valid user', async () => {
    // Test implementation
  });
});
```

## 🔍 Key Features

### Configuration Management
- Environment-based configuration
- Type-safe configuration access
- Configuration validation on startup
- Production vs development settings

### Logging & Monitoring
- Structured JSON logging in production
- Console logging in development
- Request/response logging middleware
- Health check endpoints

### Error Handling
- Centralized error handling middleware
- Standardized error response format
- Validation error handling
- Environment-specific error details

### Security
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation

### Performance
- Response compression
- Connection pooling
- Caching layer ready
- Background job processing ready

## 🔄 Development Workflow

### Adding New Domain
1. Create domain directory in `/domains`
2. Implement domain service extending `IBaseService`
3. Create repository interface extending `IBaseRepository`
4. Add repository implementation in `/infrastructure/repositories`
5. Update factory classes
6. Create API controllers and routes

### Adding New Feature
1. Add business logic to appropriate domain service
2. Create or update repository methods if needed
3. Add API endpoints in appropriate version
4. Write unit and integration tests
5. Update documentation

## 🚦 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database URL
- Set appropriate CORS origins
- Configure external cache/storage services

## 📈 Future Improvements

### Planned Features
1. Complete printer repository implementation
2. Project domain implementation
3. File storage service with S3/GCS support
4. Background job processing with Bull Queue
5. Caching service with Redis
6. Audit logging service
7. Notification service (email, push, websocket)
8. API rate limiting per user
9. API key authentication
10. Comprehensive test suite

### Architecture Enhancements
1. CQRS implementation for complex queries
2. Event sourcing for audit trails
3. Microservices decomposition
4. GraphQL API layer
5. OpenAPI/Swagger documentation
6. Performance monitoring and metrics
7. Distributed tracing
8. Circuit breaker patterns

## 📚 References

- [Domain-Driven Design](https://martinfowler.com/books/eaa.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
