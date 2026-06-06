import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Point, PageResult, PageParams } from '../types'

export interface PointListParams extends PageParams {
  keyword?: string
  regionId?: string
  status?: string
}

export async function getPointList(params: PointListParams) {
  const mockResult = await mockApi.point.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Point>>('/points', params)
}

export async function getPoint(id: string) {
  const mockResult = await mockApi.point.get(id)
  if (mockResult) return mockResult
  return get<Point>(`/points/${id}`)
}

export async function createPoint(data: Partial<Point>) {
  const mockResult = await mockApi.point.create(data)
  if (mockResult) return mockResult
  return post<Point>('/points', data)
}

export async function updatePoint(id: string, data: Partial<Point>) {
  const mockResult = await mockApi.point.update(id, data)
  if (mockResult) return mockResult
  return put<Point>(`/points/${id}`, data)
}

export async function deletePoint(id: string) {
  const mockResult = await mockApi.point.delete(id)
  if (mockResult) return mockResult
  return del(`/points/${id}`)
}

export async function importPoint(file: File) {
  const mockResult = await mockApi.point.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/points/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportPoint(params?: PointListParams) {
  const mockResult = await mockApi.point.export()
  if (mockResult) return mockResult
  return get('/points/export', params)
}
