export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  avatar?: string
  token: string
}

export interface PageParams {
  page: number
  pageSize: number
  keyword?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
  success: boolean
}

export interface Point {
  id: string
  name: string
  code: string
  address: string
  regionId: string
  regionName?: string
  contact: string
  phone: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Device {
  id: string
  name: string
  code: string
  model: string
  pointId: string
  pointName?: string
  status: 'online' | 'offline' | 'fault'
  lastHeartbeat: string
  installationDate: string
  createdAt: string
  updatedAt: string
}

export interface Repair {
  id: string
  code: string
  deviceId: string
  deviceName?: string
  pointId: string
  pointName?: string
  type: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  reporter: string
  handler?: string
  createdAt: string
  completedAt?: string
}

export interface Restock {
  id: string
  code: string
  deviceId: string
  deviceName?: string
  pointId: string
  pointName?: string
  items: RestockItem[]
  operator: string
  createdAt: string
}

export interface RestockItem {
  productId: string
  productName: string
  quantity: number
}

export interface Order {
  id: string
  orderNo: string
  deviceId: string
  deviceName?: string
  pointId: string
  pointName?: string
  productName: string
  amount: number
  status: 'completed' | 'refunded'
  paymentMethod: string
  createdAt: string
}

export interface Inventory {
  id: string
  code: string
  pointId: string
  pointName?: string
  items: InventoryItem[]
  operator: string
  status: 'draft' | 'confirmed'
  createdAt: string
}

export interface InventoryItem {
  productId: string
  productName: string
  expectedQuantity: number
  actualQuantity: number
  difference: number
}

export interface Region {
  id: string
  name: string
  code: string
  parentId?: string
  level: number
  sort: number
  createdAt: string
}
