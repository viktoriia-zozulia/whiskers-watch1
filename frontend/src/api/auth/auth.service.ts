import { req } from '../client'
import type { AuthConfig, AuthResponse, LoginDto, RegisterDto, User } from './auth.models'

export const authApi = {
  config: () => req<AuthConfig>('GET', '/api/auth/config'),
  register: (data: RegisterDto) => req<AuthResponse>('POST', '/api/auth/register', data),
  login: (data: LoginDto) => req<AuthResponse>('POST', '/api/auth/login', data),
  google: (credential: string) => req<AuthResponse>('POST', '/api/auth/google', { credential }),
  demo: () => req<AuthResponse>('POST', '/api/auth/demo'),
  me: () => req<User>('GET', '/api/auth/me'),
}
