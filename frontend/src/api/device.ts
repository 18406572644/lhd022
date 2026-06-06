import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Device, PageResult, PageParams } from '../types'

export interface DeviceListParams extends PageParams {
  keyword?: string
  status?: string
  pointId?: string
}

export async function getDeviceList(params: DeviceListParams) {
  const mockResult = await mockApi.device.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Device>>('/devices', params)
}

export async function getDevice(id: string) {
  const mockResult = await mockApi.device.get(id)
  if (mockResult) return mockResult
  return get<Device>(`/devices/${id}`)
}

export async function createDevice(data: Partial<Device>) {
  const mockResult = await mockApi.device.create(data)
  if (mockResult) return mockResult
  return post<Device>('/devices', data)
}

export async function updateDevice(id: string, data: Partial<Device>) {
  const mockResult = await mockApi.device.update(id, data)
  if (mockResult) return mockResult
  return put<Device>(`/devices/${id}`, data)
}

export async function deleteDevice(id: string) {
  const mockResult = await mockApi.device.delete(id)
  if (mockResult) return mockResult
  return del(`/devices/${id}`)
}

export async function importDevice(file: File) {
  const mockResult = await mockApi.device.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/devices/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportDevice(params?: DeviceListParams) {
  const mockResult = await mockApi.device.export()
  if (mockResult) return mockResult
  return get('/devices/export', params)
}
