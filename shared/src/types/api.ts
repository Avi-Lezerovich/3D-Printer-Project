// HTTP contract request/response DTOs (frontend <-> backend)

export interface CreateProjectRequest {
  name: string
}

export interface CreateProjectResponse {
  id: string
  name: string
  status: string
  createdAt: string
}

export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthLoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number // seconds
}
