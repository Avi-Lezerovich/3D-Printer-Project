# API Documentation

This document provides documentation for the simplified 3D Printer Control API endpoints, focusing on authentication, basic project management, and system monitoring.

## 🔗 Base URL

- **Development**: `http://localhost:3000/api/v2`
- **Production**: `https://your-domain.com/api/v2`

## 🔐 Authentication

Most API endpoints require JWT authentication via cookies or Authorization header. Health checks and authentication endpoints are public.

### Authentication Flow

1. **Login**: `POST /auth/login`
2. **Token Refresh**: `POST /auth/refresh` (automatic via HTTP-only cookies)
3. **Logout**: `POST /auth/logout`

## 📚 API Endpoints

### Authentication Endpoints

#### `POST /auth/login`
Authenticate user and return JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Invalid credentials

#### `POST /auth/register`
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### `POST /auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### `GET /auth/me`
Get current authenticated user information.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### `POST /auth/logout`
Logout user and invalidate tokens.

**Response (204):** No content

### Project Endpoints

#### `GET /projects`
List all projects for authenticated user.

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /projects`
Create new project.

**Request:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "active"
}
```

**Response (201):**
```json
{
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### System Monitoring Endpoints

#### `GET /health`
System health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "env": "development",
  "uptime": 3600,
  "memory": 67108864,
  "commit": "abc123",
  "version": "0.1.0"
}
```

#### `GET /ready`
System readiness probe for deployment monitoring.

**Response (200):**
```json
{
  "ready": true,
  "cache": {
    "connected": true,
    "driver": "memory"
  },
  "redis": true,
  "queues": {
    "active": 0,
    "pending": 0
  }
}
```

#### `GET /metrics`
System metrics and performance data.

**Response (200):**
```json
{
  "reqTotal": 1250,
  "reqActive": 3,
  "memoryRss": 67108864,
  "cache": {
    "connected": true,
    "driver": "memory"
  },
  "cleanup": {
    "at": "2024-01-01T12:00:00Z",
    "removed": 5
  }
}
```

## 🛠️ Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "validation error details"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/endpoint"
}
```

### Common Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## 🔄 Real-time Updates

The API supports real-time updates via WebSocket connections for:

- Project updates (`project.created`, `project.updated`, `project.deleted`)
- Authentication events (`security.auth.login`, `security.auth.logout`)
- System notifications and heartbeats

### WebSocket Events

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Listen for project updates
socket.on('project.created', (project) => {
  console.log('New project created:', project);
});

socket.on('project.updated', (project) => {
  console.log('Project updated:', project);
});

socket.on('project.deleted', (projectId) => {
  console.log('Project deleted:', projectId);
});

// Listen for security events
socket.on('security.auth.login', (data) => {
  console.log('User logged in:', data);
});
```

## 📊 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset time

## 🧪 Testing API Endpoints

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get projects (with auth token)
curl -X GET http://localhost:3000/api/v2/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

Import the OpenAPI specification from `/api/v1/docs` for automatic collection generation.

## 🔍 OpenAPI Specification

The complete OpenAPI specification is available at:
- **Development**: `http://localhost:3000/api/v1/docs`
- **JSON Spec**: `http://localhost:3000/api/v1/spec`

This provides interactive API documentation and allows direct testing of endpoints.