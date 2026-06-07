import { get, post } from '../utils/request'
import { mockApi } from '../mock'

export async function getOverview() {
  const mockResult = await mockApi.statistics.getOverview()
  if (mockResult) return mockResult
  return get('/v1/statistics/overview')
}

export async function getOrderTrend(params?: { days?: number }) {
  const mockResult = await mockApi.statistics.getOrderTrend()
  if (mockResult) return mockResult
  return get('/v1/statistics/order-trend', params)
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

export async function getHeatmap() {
  return get('/v1/statistics/heatmap')
}

export async function getSankey() {
  return get('/v1/statistics/sankey')
}

export async function getRadar() {
  return get('/v1/statistics/radar')
}

export async function getFunnel() {
  return get('/v1/statistics/funnel')
}

export async function getDrillDown(params: {
  dimension: string
  regionId?: number
  pointId?: number
  startDate?: string
  endDate?: string
}) {
  return get('/v1/statistics/drill-down', params)
}

export async function getOLAP(params: {
  cube: string
  dimensions: string[]
  measures: string[]
  filters?: any
  drillDown?: string
  rollUp?: string
  slice?: { dimension: string; value: any }
  dice?: { dimension: string; values: any[] }
}) {
  return post('/v1/statistics/olap', params)
}
