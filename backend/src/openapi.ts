// Minimal OpenAPI spec (expand as needed)
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: '3D Printer Project API',
    version: process.env.npm_package_version || '0.1.0',
    description: `
      # 3D Printer Control API
      
      This API provides essential 3D printer control capabilities including
      authentication, project management, and monitoring functionality.
      
      ## Authentication
      
      The API uses JWT-based authentication with HTTP-only cookies for security.
      Most endpoints require authentication except for login, register, and health checks.
      
      ## Rate Limiting
      
      - Authentication endpoints: 5 requests per minute per IP
      - General API endpoints: 100 requests per minute per user
      
      ## Core Features
      
      - User authentication and session management
      - Basic project listing and creation
      - Health monitoring and status endpoints
    `,
    contact: {
      name: 'API Support',
      email: 'support@3dprinterproject.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    { url: '/api/v1', description: 'Current version' }
  ],
  paths: {
    '/health': { get: { summary: 'Health check (deprecated path)', responses: { '200': { description: 'OK' } } } },
    '/auth/login': { post: { summary: 'Login', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } }, responses: { '200': { description: 'Logged in', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, '401': { description: 'Unauthorized' } } } },
    '/auth/register': { post: { summary: 'Register user', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } }, responses: { '201': { description: 'Registered' }, '400': { description: 'Validation error' } } } },
    '/auth/refresh': { post: { summary: 'Rotate refresh token', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } }, responses: { '200': { description: 'Rotated', content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshResponse' } } } }, '401': { description: 'Invalid token' } } } },
    '/auth/me': { get: { summary: 'Current user', responses: { '200': { description: 'User or null' } } } },
    '/auth/logout': { post: { summary: 'Logout', responses: { '204': { description: 'Logged out' } } } },
    '/projects': { get: { summary: 'List projects', responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectList' } } } } } }, post: { summary: 'Create project', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } } } } },
    '/flags': { get: { summary: 'List feature flags', responses: { '200': { description: 'Flags', content: { 'application/json': { schema: { $ref: '#/components/schemas/Flags' } } } } } } }
  },
  components: {
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string' } } }
        }
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
  ProjectCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] }
        }
  },
      Project: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' }, status: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } }
      },
      ProjectList: {
        type: 'object',
        properties: { projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } } }
      },
      Flags: {
        type: 'object',
        properties: { flags: { type: 'object', additionalProperties: { type: 'string' } } }
      }
    }
  }
}
