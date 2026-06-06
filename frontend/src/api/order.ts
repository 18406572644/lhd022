import { get, post, put, del } from '../utils/request'
import { mockApi } from '../mock'
import type { Order, PageResult, PageParams } from '../types'

export interface OrderListParams extends PageParams {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
}

export async function getOrderList(params: OrderListParams) {
  const mockResult = await mockApi.order.list(params)
  if (mockResult) return mockResult
  return get<PageResult<Order>>('/orders', params)
}

export async function getOrder(id: string) {
  const mockResult = await mockApi.order.get(id)
  if (mockResult) return mockResult
  return get<Order>(`/orders/${id}`)
}

export async function createOrder(data: Partial<Order>) {
  const mockResult = await mockApi.order.create(data)
  if (mockResult) return mockResult
  return post<Order>('/orders', data)
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const mockResult = await mockApi.order.update(id, data)
  if (mockResult) return mockResult
  return put<Order>(`/orders/${id}`, data)
}

export async function deleteOrder(id: string) {
  const mockResult = await mockApi.order.delete(id)
  if (mockResult) return mockResult
  return del(`/orders/${id}`)
}

export async function importOrder(file: File) {
  const mockResult = await mockApi.order.import()
  if (mockResult) return mockResult
  const formData = new FormData()
  formData.append('file', file)
  return post('/orders/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export async function exportOrder(params?: OrderListParams) {
  const mockResult = await mockApi.order.export()
  if (mockResult) return mockResult
  return get('/orders/export', params)
}
