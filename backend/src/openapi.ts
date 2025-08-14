// Minimal OpenAPI spec (expand as needed)
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: '3D Printer Project API',
    version: process.env.npm_package_version || '0.1.0',
    description: 'API documentation for the 3D Printer Project backend.'
  },
  servers: [
    { url: '/api/v1', description: 'Current version' }
  ],
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/auth/login': { post: { summary: 'Login', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } }, responses: { '200': { description: 'Logged in' }, '401': { description: 'Unauthorized' } } } },
    '/auth/me': { get: { summary: 'Current user', responses: { '200': { description: 'User or null' } } } },
    '/auth/logout': { post: { summary: 'Logout', responses: { '204': { description: 'Logged out' } } } },
    '/projects': { get: { summary: 'List projects', responses: { '200': { description: 'List' } } }, post: { summary: 'Create project', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectCreate' } } } }, responses: { '201': { description: 'Created' } } } }
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
      ProjectCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] }
        }
      }
    }
  }
}
