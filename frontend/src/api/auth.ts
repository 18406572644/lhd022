import { post } from '../utils/request'
import { User } from '../types'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export function login(params: LoginParams) {
  return post<LoginResult>('/auth/login', params)
}

export function logout() {
  return post('/auth/logout')
}

export function getCurrentUser() {
  return post<User>('/auth/current')
}
