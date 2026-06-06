import type { Point, Device, Repair, Restock, Order, Inventory, Region } from '../types'

export const mockRegions: Region[] = [
  { id: '1', name: '华东区', code: 'HD', parentId: undefined, level: 1, sort: 1, createdAt: '2024-01-01 00:00:00' },
  { id: '2', name: '华北区', code: 'HB', parentId: undefined, level: 1, sort: 2, createdAt: '2024-01-01 00:00:00' },
  { id: '3', name: '华南区', code: 'HN', parentId: undefined, level: 1, sort: 3, createdAt: '2024-01-01 00:00:00' },
  { id: '1-1', name: '上海市', code: 'HD-SH', parentId: '1', level: 2, sort: 1, createdAt: '2024-01-01 00:00:00' },
  { id: '1-2', name: '江苏省', code: 'HD-JS', parentId: '1', level: 2, sort: 2, createdAt: '2024-01-01 00:00:00' },
  { id: '1-3', name: '浙江省', code: 'HD-ZJ', parentId: '1', level: 2, sort: 3, createdAt: '2024-01-01 00:00:00' },
  { id: '2-1', name: '北京市', code: 'HB-BJ', parentId: '2', level: 2, sort: 1, createdAt: '2024-01-01 00:00:00' },
  { id: '2-2', name: '天津市', code: 'HB-TJ', parentId: '2', level: 2, sort: 2, createdAt: '2024-01-01 00:00:00' },
  { id: '3-1', name: '广东省', code: 'HN-GD', parentId: '3', level: 2, sort: 1, createdAt: '2024-01-01 00:00:00' },
  { id: '3-2', name: '福建省', code: 'HN-FJ', parentId: '3', level: 2, sort: 2, createdAt: '2024-01-01 00:00:00' },
]

const regionMap = mockRegions.reduce((acc, r) => {
  acc[r.id] = r.name
  return acc
}, {} as Record<string, string>)

export const mockPoints: Point[] = Array.from({ length: 50 }, (_, i) => ({
  id: `P${String(i + 1).padStart(4, '0')}`,
  name: `点位${i + 1}`,
  code: `PT${String(i + 1).padStart(6, '0')}`,
  address: `地址${i + 1}号`,
  regionId: mockRegions[Math.floor(Math.random() * mockRegions.length)].id,
  get regionName() { return regionMap[this.regionId] },
  contact: `联系人${i + 1}`,
  phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  createdAt: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 10:00:00`,
  updatedAt: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 10:00:00`,
}))

const pointMap = mockPoints.reduce((acc, p) => {
  acc[p.id] = p.name
  return acc
}, {} as Record<string, string>)

export const mockDevices: Device[] = Array.from({ length: 100 }, (_, i) => ({
  id: `D${String(i + 1).padStart(4, '0')}`,
  name: `智能设备${i + 1}`,
  code: `SN${String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0')}`,
  model: ['Model-A', 'Model-B', 'Model-C'][Math.floor(Math.random() * 3)],
  pointId: mockPoints[Math.floor(Math.random() * mockPoints.length)].id,
  get pointName() { return pointMap[this.pointId] },
  status: (['online', 'offline', 'fault'] as const)[Math.floor(Math.random() * 3)],
  lastHeartbeat: `2024-06-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
  installationDate: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  createdAt: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 10:00:00`,
  updatedAt: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 10:00:00`,
}))

const deviceMap = mockDevices.reduce((acc, d) => {
  acc[d.id] = d.name
  return acc
}, {} as Record<string, string>)

export const mockRepairs: Repair[] = Array.from({ length: 30 }, (_, i) => {
  const device = mockDevices[Math.floor(Math.random() * mockDevices.length)]
  return {
    id: `R${String(i + 1).padStart(4, '0')}`,
    code: `BX${String(i + 1).padStart(6, '0')}`,
    deviceId: device.id,
    get deviceName() { return deviceMap[this.deviceId] },
    pointId: device.pointId,
    get pointName() { return pointMap[this.pointId] },
    type: ['硬件故障', '软件故障', '网络故障', '其他'][Math.floor(Math.random() * 4)],
    description: `报修描述${i + 1}，设备出现异常情况需要处理`,
    status: (['pending', 'processing', 'completed', 'cancelled'] as const)[Math.floor(Math.random() * 4)],
    reporter: `报修人${i + 1}`,
    handler: Math.random() > 0.3 ? `处理人${Math.floor(Math.random() * 10) + 1}` : undefined,
    createdAt: `2024-06-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
    completedAt: Math.random() > 0.5 ? `2024-06-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00` : undefined,
  }
})

const products = [
  { id: 'PRD001', name: '充电宝' },
  { id: 'PRD002', name: '雨伞' },
  { id: 'PRD003', name: '数据线' },
  { id: 'PRD004', name: '耳机' },
  { id: 'PRD005', name: '充电器' },
]

export const mockRestocks: Restock[] = Array.from({ length: 40 }, (_, i) => {
  const device = mockDevices[Math.floor(Math.random() * mockDevices.length)]
  const itemCount = Math.floor(Math.random() * 3) + 1
  const items = Array.from({ length: itemCount }, () => {
    const product = products[Math.floor(Math.random() * products.length)]
    return {
      productId: product.id,
      productName: product.name,
      quantity: Math.floor(Math.random() * 20) + 5,
    }
  })
  return {
    id: `RS${String(i + 1).padStart(4, '0')}`,
    code: `BH${String(i + 1).padStart(6, '0')}`,
    deviceId: device.id,
    get deviceName() { return deviceMap[this.deviceId] },
    pointId: device.pointId,
    get pointName() { return pointMap[this.pointId] },
    items,
    operator: `运营人员${Math.floor(Math.random() * 20) + 1}`,
    createdAt: `2024-06-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
  }
})

export const mockOrders: Order[] = Array.from({ length: 100 }, (_, i) => {
  const device = mockDevices[Math.floor(Math.random() * mockDevices.length)]
  const product = products[Math.floor(Math.random() * products.length)]
  return {
    id: `O${String(i + 1).padStart(4, '0')}`,
    orderNo: `ORD${Date.now()}${String(i).padStart(4, '0')}`,
    deviceId: device.id,
    get deviceName() { return deviceMap[this.deviceId] },
    pointId: device.pointId,
    get pointName() { return pointMap[this.pointId] },
    productName: product.name,
    amount: Math.floor(Math.random() * 100) + 10,
    status: Math.random() > 0.1 ? 'completed' : 'refunded',
    paymentMethod: ['微信支付', '支付宝', '银行卡'][Math.floor(Math.random() * 3)],
    createdAt: `2024-06-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
  }
})

export const mockInventory: Inventory[] = Array.from({ length: 20 }, (_, i) => {
  const point = mockPoints[Math.floor(Math.random() * mockPoints.length)]
  const itemCount = Math.floor(Math.random() * 4) + 2
  const items = Array.from({ length: itemCount }, () => {
    const product = products[Math.floor(Math.random() * products.length)]
    const expected = Math.floor(Math.random() * 50) + 10
    const actual = Math.max(0, expected + Math.floor(Math.random() * 10) - 5)
    return {
      productId: product.id,
      productName: product.name,
      expectedQuantity: expected,
      actualQuantity: actual,
      difference: actual - expected,
    }
  })
  return {
    id: `INV${String(i + 1).padStart(4, '0')}`,
    code: `PD${String(i + 1).padStart(6, '0')}`,
    pointId: point.id,
    get pointName() { return pointMap[this.pointId] },
    items,
    operator: `盘点人员${Math.floor(Math.random() * 10) + 1}`,
    status: Math.random() > 0.3 ? 'confirmed' : 'draft',
    createdAt: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 10:00:00`,
  }
})

export const mockStatistics = {
  overview: {
    totalPoints: mockPoints.length,
    totalDevices: mockDevices.length,
    onlineDevices: mockDevices.filter(d => d.status === 'online').length,
    offlineDevices: mockDevices.filter(d => d.status === 'offline').length,
    faultDevices: mockDevices.filter(d => d.status === 'fault').length,
    todayOrders: 89,
    todayAmount: 5680,
    pendingRepairs: mockRepairs.filter(r => r.status === 'pending' || r.status === 'processing').length,
    totalAmount: mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
  },
  orderTrend: {
    dates: ['06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07'],
    counts: [120, 132, 101, 134, 90, 230, 210],
    amounts: [3600, 4200, 3100, 4500, 2800, 7200, 6500],
  },
  deviceStatus: [
    { name: '在线', value: mockDevices.filter(d => d.status === 'online').length, color: '#52C41A' },
    { name: '离线', value: mockDevices.filter(d => d.status === 'offline').length, color: '#8C8C8C' },
    { name: '故障', value: mockDevices.filter(d => d.status === 'fault').length, color: '#F5222D' },
  ],
  regionData: [
    { name: '华东区', points: 45, devices: 128, orders: 1250 },
    { name: '华北区', points: 38, devices: 105, orders: 980 },
    { name: '华南区', points: 45, devices: 123, orders: 1180 },
  ],
}
