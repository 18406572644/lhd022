import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Restock, PageResult, PageParams } from '../types'

export interface RestockListParams extends PageParams {
  keyword?: string
  startDate?: string
  endDate?: string
}

export async function getRestockList(params: RestockListParams) {
  const mockResult = await mockApi.restock.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Restock>>('/restocks', params)
}

export async function getRestock(id: string) {
  const mockResult = await mockApi.restock.get(id)
  if (mockResult) return mockResult
  return get<Restock>(`/restocks/${id}`)
}

export async function createRestock(data: Partial<Restock>) {
  const mockResult = await mockApi.restock.create(data)
  if (mockResult) return mockResult
  return post<Restock>('/restocks', data)
}

export async function updateRestock(id: string, data: Partial<Restock>) {
  const mockResult = await mockApi.restock.update(id, data)
  if (mockResult) return mockResult
  return put<Restock>(`/restocks/${id}`, data)
}

export async function deleteRestock(id: string) {
  const mockResult = await mockApi.restock.delete(id)
  if (mockResult) return mockResult
  return del(`/restocks/${id}`)
}

export async function importRestock(file: File) {
  const mockResult = await mockApi.restock.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/restocks/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportRestock(params?: RestockListParams) {
  const mockResult = await mockApi.restock.export()
  if (mockResult) return mockResult
  return get('/restocks/export', params)
}
