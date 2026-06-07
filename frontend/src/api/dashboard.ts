import { get, post, put, del } from '../utils/request'

export interface Dashboard {
  id: number
  name: string
  description?: string
  userId?: string
  isPublic: boolean
  layout?: any
  widgets?: any
  sort: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDashboardDto {
  name: string
  description?: string
  isPublic?: boolean
  layout?: any
  widgets?: any
  sort?: number
}

export interface UpdateDashboardDto {
  name?: string
  description?: string
  isPublic?: boolean
  layout?: any
  widgets?: any
  sort?: number
  status?: string
}

export interface WidgetConfig {
  id: string
  type: string
  title: string
  dataSource?: string
  dataKey?: string
  icon?: string
  color?: string
  height?: number
  prefix?: string
}

export async function getDashboards() {
  return get<Dashboard[]>('/v1/dashboards')
}

export async function getDashboard(id: number) {
  return get<Dashboard>(`/v1/dashboards/${id}`)
}

export async function createDashboard(data: CreateDashboardDto) {
  return post<Dashboard>('/v1/dashboards', data)
}

export async function updateDashboard(id: number, data: UpdateDashboardDto) {
  return put<Dashboard>(`/v1/dashboards/${id}`, data)
}

export async function deleteDashboard(id: number) {
  return del(`/v1/dashboards/${id}`)
}

export async function getDefaultWidgets() {
  return get<WidgetConfig[]>('/v1/dashboards/widgets')
}
