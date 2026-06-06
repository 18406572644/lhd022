import { get } from '../utils/request'
import { mockApi } from '../mock'

export async function getOverview() {
  const mockResult = await mockApi.statistics.getOverview()
  if (mockResult) return mockResult
  return get('/v1/statistics/overview')
}

export async function getOrderTrend() {
  const mockResult = await mockApi.statistics.getOrderTrend()
  if (mockResult) return mockResult
  return get('/v1/statistics/order-trend')
}

export async function getDeviceStatus() {
  const mockResult = await mockApi.statistics.getDeviceStatus()
  if (mockResult) return mockResult
  return get('/v1/statistics/device-status')
}

export async function getRegionData() {
  const mockResult = await mockApi.statistics.getRegionData()
  if (mockResult) return mockResult
  return get('/v1/statistics/region-data')
}
