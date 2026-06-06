import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Repair, PageResult, PageParams } from '../types'

export interface RepairListParams extends PageParams {
  keyword?: string
  status?: string
  type?: string
}

export async function getRepairList(params: RepairListParams) {
  const mockResult = await mockApi.repair.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Repair>>('/repairs', params)
}

export async function getRepair(id: string) {
  const mockResult = await mockApi.repair.get(id)
  if (mockResult) return mockResult
  return get<Repair>(`/repairs/${id}`)
}

export async function createRepair(data: Partial<Repair>) {
  const mockResult = await mockApi.repair.create(data)
  if (mockResult) return mockResult
  return post<Repair>('/repairs', data)
}

export async function updateRepair(id: string, data: Partial<Repair>) {
  const mockResult = await mockApi.repair.update(id, data)
  if (mockResult) return mockResult
  return put<Repair>(`/repairs/${id}`, data)
}

export async function deleteRepair(id: string) {
  const mockResult = await mockApi.repair.delete(id)
  if (mockResult) return mockResult
  return del(`/repairs/${id}`)
}

export async function importRepair(file: File) {
  const mockResult = await mockApi.repair.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/repairs/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportRepair(params?: RepairListParams) {
  const mockResult = await mockApi.repair.export()
  if (mockResult) return mockResult
  return get('/repairs/export', params)
}
