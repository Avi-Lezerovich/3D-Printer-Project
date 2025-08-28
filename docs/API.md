# API Documentation

This document provides documentation for the simplified 3D Printer Control API endpoints, focusing on authentication, basic project management, and system monitoring.

## 🔗 Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

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

### Task Management Endpoints

#### `GET /project-management/tasks`
List all tasks with optional filtering.

**Query Parameters:**
- `status`: Filter by task status (`todo`, `in-progress`, `done`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `assignee`: Filter by assignee ID
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "todo",
      "priority": "medium",
      "assignee": "user-id",
      "dueDate": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `POST /project-management/tasks`
Create new task.

**Request:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "assignee": "user-id",
  "dueDate": "2024-01-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "task": {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "assignee": "user-id",
    "dueDate": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `PUT /project-management/tasks/:id`
Update existing task.

**Parameters:**
- `id`: Task UUID

**Request:**
```json
{
  "title": "Updated Task Title",
  "status": "in-progress",
  "priority": "high"
}
```

**Response (200):**
```json
{
  "task": {
    "id": "uuid",
    "title": "Updated Task Title",
    "description": "Task description",
    "status": "in-progress",
    "priority": "high",
    "assignee": "user-id",
    "dueDate": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `DELETE /project-management/tasks/:id`
Delete task.

**Parameters:**
- `id`: Task UUID

**Response (204):** No content

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

- Task updates (`task.created`, `task.updated`, `task.deleted`)
- Project updates (`project.created`, `project.updated`, `project.deleted`)
- System notifications

### WebSocket Events

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Listen for task updates
socket.on('task.created', (task) => {
  console.log('New task created:', task);
});

socket.on('task.updated', (task) => {
  console.log('Task updated:', task);
});

socket.on('task.deleted', (taskId) => {
  console.log('Task deleted:', taskId);
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

# Get tasks (with auth token)
curl -X GET http://localhost:3000/api/v1/project-management/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

Import the OpenAPI specification from `/api/v1/docs` for automatic collection generation.

## 🔍 OpenAPI Specification

The complete OpenAPI specification is available at:
- **Development**: `http://localhost:3000/api/v1/docs`
- **JSON Spec**: `http://localhost:3000/api/v1/spec`

This provides interactive API documentation and allows direct testing of endpoints.