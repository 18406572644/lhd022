import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Region } from '../types'

export interface RegionListParams {
  keyword?: string
}

export async function getRegionList(params?: RegionListParams) {
  const mockResult = await mockApi.region.list(params)
  if (mockResult) return mockResult
  return get<Region[]>('/regions', params)
}

export async function getRegionTree() {
  const mockResult = await mockApi.region.tree()
  if (mockResult) return mockResult
  return get<any[]>('/regions/tree')
}

export async function getRegion(id: string) {
  const mockResult = await mockApi.region.get(id)
  if (mockResult) return mockResult
  return get<Region>(`/regions/${id}`)
}

export async function createRegion(data: Partial<Region>) {
  const mockResult = await mockApi.region.create(data)
  if (mockResult) return mockResult
  return post<Region>('/regions', data)
}

export async function updateRegion(id: string, data: Partial<Region>) {
  const mockResult = await mockApi.region.update(id, data)
  if (mockResult) return mockResult
  return put<Region>(`/regions/${id}`, data)
}

export async function deleteRegion(id: string) {
  const mockResult = await mockApi.region.delete(id)
  if (mockResult) return mockResult
  return del(`/regions/${id}`)
}

export async function importRegion(file: File) {
  const mockResult = await mockApi.region.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/regions/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportRegion() {
  const mockResult = await mockApi.region.export()
  if (mockResult) return mockResult
  return get('/regions/export')
}
