import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { ApiResponse } from '../types'

let lastRedirectTime = 0

function clearAuthAndRedirect() {
  const now = Date.now()
  if (now - lastRedirectTime < 2000) {
    return
  }
  lastRedirectTime = now

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('user-storage')
  localStorage.removeItem('persist:user-storage')

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 0 && res.code !== 200) {
      message.error(res.message || '请求失败')
      if (res.code === 401) {
        clearAuthAndRedirect()
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data as unknown as AxiosResponse
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '网络错误'
    message.error(msg)
    if (error.response?.status === 401) {
      clearAuthAndRedirect()
    }
    return Promise.reject(error)
  }
)

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return service.request<T, T>(config)
}

export function get<T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'GET', url, params, ...config })
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'POST', url, data, ...config })
}

export function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'PUT', url, data, ...config })
}

export function del<T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'DELETE', url, params, ...config })
}

export default service
