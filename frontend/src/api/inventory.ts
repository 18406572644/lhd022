import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Inventory, PageResult, PageParams } from '../types'

export interface InventoryListParams extends PageParams {
  keyword?: string
  status?: string
  pointId?: string
}

export async function getInventoryList(params: InventoryListParams) {
  const mockResult = await mockApi.inventory.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Inventory>>('/inventory', params)
}

export async function getInventory(id: string) {
  const mockResult = await mockApi.inventory.get(id)
  if (mockResult) return mockResult
  return get<Inventory>(`/inventory/${id}`)
}

export async function createInventory(data: Partial<Inventory>) {
  const mockResult = await mockApi.inventory.create(data)
  if (mockResult) return mockResult
  return post<Inventory>('/inventory', data)
}

export async function updateInventory(id: string, data: Partial<Inventory>) {
  const mockResult = await mockApi.inventory.update(id, data)
  if (mockResult) return mockResult
  return put<Inventory>(`/inventory/${id}`, data)
}

export async function deleteInventory(id: string) {
  const mockResult = await mockApi.inventory.delete(id)
  if (mockResult) return mockResult
  return del(`/inventory/${id}`)
}

export async function importInventory(file: File) {
  const mockResult = await mockApi.inventory.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/inventory/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportInventory(params?: InventoryListParams) {
  const mockResult = await mockApi.inventory.export()
  if (mockResult) return mockResult
  return get('/inventory/export', params)
}
