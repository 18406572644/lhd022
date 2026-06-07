import { get, post, put, del } from '../utils/request'

export interface AlertConfig {
  id: number
  name: string
  metricType: string
  operator: string
  threshold: number
  level: string
  notifyChannels: string[]
  receivers: string[]
  checkInterval: number
  silenceDuration: number
  lastCheckTime?: Date
  lastAlertTime?: Date
  isEnabled: boolean
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface AlertRecord {
  id: number
  configId: number
  name: string
  metricType: string
  currentValue: number
  threshold: number
  operator: string
  level: string
  message: string
  status: string
  handler?: string
  handleRemark?: string
  handleTime?: Date
  notifyStatus: string
  notifyResult?: string
  createdAt: Date
}

export interface CreateAlertConfigDto {
  name: string
  metricType: string
  operator: string
  threshold: number
  level?: string
  notifyChannels?: string[]
  receivers?: string[]
  checkInterval?: number
  silenceDuration?: number
  isEnabled?: boolean
}

export interface UpdateAlertConfigDto {
  name?: string
  metricType?: string
  operator?: string
  threshold?: number
  level?: string
  notifyChannels?: string[]
  receivers?: string[]
  checkInterval?: number
  silenceDuration?: number
  isEnabled?: boolean
}

export interface HandleAlertRecordDto {
  status: string
  handleRemark?: string
}

export interface MetricInfo {
  value: string
  label: string
  unit: string
}

export interface AlertSummary {
  total: number
  pending: number
  processing: number
  resolved: number
  ignored: number
  levelStats: Record<string, number>
  recentRecords: AlertRecord[]
}

export async function getAvailableMetrics() {
  return get<MetricInfo[]>('/v1/alerts/metrics')
}

export async function getAlertSummary() {
  return get<AlertSummary>('/v1/alerts/summary')
}

export async function checkAlerts() {
  return post('/v1/alerts/check')
}

export async function getAlertConfigs() {
  return get<AlertConfig[]>('/v1/alerts/configs')
}

export async function getAlertConfig(id: number) {
  return get<AlertConfig>(`/v1/alerts/configs/${id}`)
}

export async function createAlertConfig(data: CreateAlertConfigDto) {
  return post<AlertConfig>('/v1/alerts/configs', data)
}

export async function updateAlertConfig(id: number, data: UpdateAlertConfigDto) {
  return put<AlertConfig>(`/v1/alerts/configs/${id}`, data)
}

export async function deleteAlertConfig(id: number) {
  return del(`/v1/alerts/configs/${id}`)
}

export async function getAlertRecords(params?: {
  status?: string
  level?: string
  metricType?: string
  page?: number
  pageSize?: number
}) {
  return get<{
    data: AlertRecord[]
    total: number
    page: number
    pageSize: number
  }>('/v1/alerts/records', params)
}

export async function getAlertRecord(id: number) {
  return get<AlertRecord>(`/v1/alerts/records/${id}`)
}

export async function handleAlertRecord(id: number, data: HandleAlertRecordDto) {
  return put<AlertRecord>(`/v1/alerts/records/${id}/handle`, data)
}
