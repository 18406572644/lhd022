import type { Point, Device, Repair, Restock, Order, Inventory, Region, PageResult, PageParams } from '../types'
import { mockPoints, mockDevices, mockRepairs, mockRestocks, mockOrders, mockInventory, mockRegions, mockStatistics } from './data'

const USE_MOCK = false

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function paginate<T>(list: T[], params: PageParams): PageResult<T> {
  const { page = 1, pageSize = 10 } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize,
  }
}

export const mockApi = {
  point: {
    list: (params: PageParams & { keyword?: string; regionId?: string; status?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockPoints]
      if (params.keyword) {
        list = list.filter(p => p.name.includes(params.keyword!) || p.code.includes(params.keyword!))
      }
      if (params.regionId) {
        list = list.filter(p => p.regionId === params.regionId)
      }
      if (params.status) {
        list = list.filter(p => p.status === params.status)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockPoints.find(p => p.id === id))
    },
    create: (data: Partial<Point>) => {
      if (!USE_MOCK) return null
      const newPoint: Point = {
        ...data,
        id: `P${String(mockPoints.length + 1).padStart(4, '0')}`,
        code: data.code || `PT${String(mockPoints.length + 1).padStart(6, '0')}`,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Point
      mockPoints.unshift(newPoint)
      return delay(newPoint)
    },
    update: (id: string, data: Partial<Point>) => {
      if (!USE_MOCK) return null
      const index = mockPoints.findIndex(p => p.id === id)
      if (index > -1) {
        mockPoints[index] = { ...mockPoints[index], ...data, updatedAt: new Date().toISOString() }
        return delay(mockPoints[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockPoints.findIndex(p => p.id === id)
      if (index > -1) {
        mockPoints.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 10 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockPoints)
    },
  },

  device: {
    list: (params: PageParams & { keyword?: string; status?: string; pointId?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockDevices]
      if (params.keyword) {
        list = list.filter(d => d.name.includes(params.keyword!) || d.code.includes(params.keyword!))
      }
      if (params.status) {
        list = list.filter(d => d.status === params.status)
      }
      if (params.pointId) {
        list = list.filter(d => d.pointId === params.pointId)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockDevices.find(d => d.id === id))
    },
    create: (data: Partial<Device>) => {
      if (!USE_MOCK) return null
      const newDevice: Device = {
        ...data,
        id: `D${String(mockDevices.length + 1).padStart(4, '0')}`,
        code: data.code || `SN${String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0')}`,
        status: data.status || 'online',
        lastHeartbeat: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Device
      mockDevices.unshift(newDevice)
      return delay(newDevice)
    },
    update: (id: string, data: Partial<Device>) => {
      if (!USE_MOCK) return null
      const index = mockDevices.findIndex(d => d.id === id)
      if (index > -1) {
        mockDevices[index] = { ...mockDevices[index], ...data, updatedAt: new Date().toISOString() }
        return delay(mockDevices[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockDevices.findIndex(d => d.id === id)
      if (index > -1) {
        mockDevices.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 20 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockDevices)
    },
  },

  repair: {
    list: (params: PageParams & { keyword?: string; status?: string; type?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockRepairs]
      if (params.keyword) {
        list = list.filter(r => r.code.includes(params.keyword!) || r.description.includes(params.keyword!))
      }
      if (params.status) {
        list = list.filter(r => r.status === params.status)
      }
      if (params.type) {
        list = list.filter(r => r.type === params.type)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockRepairs.find(r => r.id === id))
    },
    create: (data: Partial<Repair>) => {
      if (!USE_MOCK) return null
      const newRepair: Repair = {
        ...data,
        id: `R${String(mockRepairs.length + 1).padStart(4, '0')}`,
        code: `BX${String(mockRepairs.length + 1).padStart(6, '0')}`,
        status: data.status || 'pending',
        createdAt: new Date().toISOString(),
      } as Repair
      mockRepairs.unshift(newRepair)
      return delay(newRepair)
    },
    update: (id: string, data: Partial<Repair>) => {
      if (!USE_MOCK) return null
      const index = mockRepairs.findIndex(r => r.id === id)
      if (index > -1) {
        mockRepairs[index] = { ...mockRepairs[index], ...data }
        if (data.status === 'completed' && !mockRepairs[index].completedAt) {
          mockRepairs[index].completedAt = new Date().toISOString()
        }
        return delay(mockRepairs[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockRepairs.findIndex(r => r.id === id)
      if (index > -1) {
        mockRepairs.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 5 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockRepairs)
    },
  },

  restock: {
    list: (params: PageParams & { keyword?: string; startDate?: string; endDate?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockRestocks]
      if (params.keyword) {
        list = list.filter(r => r.code.includes(params.keyword!))
      }
      if (params.startDate) {
        list = list.filter(r => r.createdAt >= params.startDate!)
      }
      if (params.endDate) {
        list = list.filter(r => r.createdAt <= params.endDate!)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockRestocks.find(r => r.id === id))
    },
    create: (data: Partial<Restock>) => {
      if (!USE_MOCK) return null
      const newRestock: Restock = {
        ...data,
        id: `RS${String(mockRestocks.length + 1).padStart(4, '0')}`,
        code: `BH${String(mockRestocks.length + 1).padStart(6, '0')}`,
        items: data.items || [],
        createdAt: new Date().toISOString(),
      } as Restock
      mockRestocks.unshift(newRestock)
      return delay(newRestock)
    },
    update: (id: string, data: Partial<Restock>) => {
      if (!USE_MOCK) return null
      const index = mockRestocks.findIndex(r => r.id === id)
      if (index > -1) {
        mockRestocks[index] = { ...mockRestocks[index], ...data }
        return delay(mockRestocks[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockRestocks.findIndex(r => r.id === id)
      if (index > -1) {
        mockRestocks.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 15 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockRestocks)
    },
  },

  order: {
    list: (params: PageParams & { keyword?: string; status?: string; startDate?: string; endDate?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockOrders]
      if (params.keyword) {
        list = list.filter(o => o.orderNo.includes(params.keyword!) || o.productName.includes(params.keyword!))
      }
      if (params.status) {
        list = list.filter(o => o.status === params.status)
      }
      if (params.startDate) {
        list = list.filter(o => o.createdAt >= params.startDate!)
      }
      if (params.endDate) {
        list = list.filter(o => o.createdAt <= params.endDate!)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockOrders.find(o => o.id === id))
    },
    create: (data: Partial<Order>) => {
      if (!USE_MOCK) return null
      const newOrder: Order = {
        ...data,
        id: `O${String(mockOrders.length + 1).padStart(4, '0')}`,
        orderNo: `ORD${Date.now()}${String(mockOrders.length + 1).padStart(4, '0')}`,
        status: data.status || 'completed',
        createdAt: new Date().toISOString(),
      } as Order
      mockOrders.unshift(newOrder)
      return delay(newOrder)
    },
    update: (id: string, data: Partial<Order>) => {
      if (!USE_MOCK) return null
      const index = mockOrders.findIndex(o => o.id === id)
      if (index > -1) {
        mockOrders[index] = { ...mockOrders[index], ...data }
        return delay(mockOrders[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockOrders.findIndex(o => o.id === id)
      if (index > -1) {
        mockOrders.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 50 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockOrders)
    },
  },

  inventory: {
    list: (params: PageParams & { keyword?: string; status?: string; pointId?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockInventory]
      if (params.keyword) {
        list = list.filter(i => i.code.includes(params.keyword!))
      }
      if (params.status) {
        list = list.filter(i => i.status === params.status)
      }
      if (params.pointId) {
        list = list.filter(i => i.pointId === params.pointId)
      }
      return delay(paginate(list, params))
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockInventory.find(i => i.id === id))
    },
    create: (data: Partial<Inventory>) => {
      if (!USE_MOCK) return null
      const newInventory: Inventory = {
        ...data,
        id: `INV${String(mockInventory.length + 1).padStart(4, '0')}`,
        code: `PD${String(mockInventory.length + 1).padStart(6, '0')}`,
        items: data.items || [],
        status: data.status || 'draft',
        createdAt: new Date().toISOString(),
      } as Inventory
      mockInventory.unshift(newInventory)
      return delay(newInventory)
    },
    update: (id: string, data: Partial<Inventory>) => {
      if (!USE_MOCK) return null
      const index = mockInventory.findIndex(i => i.id === id)
      if (index > -1) {
        mockInventory[index] = { ...mockInventory[index], ...data }
        return delay(mockInventory[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockInventory.findIndex(i => i.id === id)
      if (index > -1) {
        mockInventory.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 8 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockInventory)
    },
  },

  region: {
    list: (params?: { keyword?: string }) => {
      if (!USE_MOCK) return null
      let list = [...mockRegions]
      if (params?.keyword) {
        list = list.filter(r => r.name.includes(params.keyword!) || r.code.includes(params.keyword!))
      }
      return delay(list)
    },
    get: (id: string) => {
      if (!USE_MOCK) return null
      return delay(mockRegions.find(r => r.id === id))
    },
    create: (data: Partial<Region>) => {
      if (!USE_MOCK) return null
      const newRegion: Region = {
        ...data,
        id: `${Date.now()}`,
        code: data.code || `REG${String(mockRegions.length + 1).padStart(4, '0')}`,
        level: data.level || 1,
        sort: data.sort || mockRegions.length + 1,
        createdAt: new Date().toISOString(),
      } as Region
      mockRegions.push(newRegion)
      return delay(newRegion)
    },
    update: (id: string, data: Partial<Region>) => {
      if (!USE_MOCK) return null
      const index = mockRegions.findIndex(r => r.id === id)
      if (index > -1) {
        mockRegions[index] = { ...mockRegions[index], ...data }
        return delay(mockRegions[index])
      }
      return delay(null)
    },
    delete: (id: string) => {
      if (!USE_MOCK) return null
      const index = mockRegions.findIndex(r => r.id === id)
      if (index > -1) {
        mockRegions.splice(index, 1)
      }
      return delay({ success: true })
    },
    import: () => {
      if (!USE_MOCK) return null
      return delay({ success: true, count: 5 })
    },
    export: () => {
      if (!USE_MOCK) return null
      return delay(mockRegions)
    },
    tree: () => {
      if (!USE_MOCK) return null
      const buildTree = (parentId?: string): any[] => {
        return mockRegions
          .filter(r => r.parentId === parentId)
          .sort((a, b) => a.sort - b.sort)
          .map(r => ({
            ...r,
            key: r.id,
            title: r.name,
            children: buildTree(r.id),
          }))
      }
      return delay(buildTree())
    },
  },

  statistics: {
    getOverview: () => {
      if (!USE_MOCK) return null
      return delay(mockStatistics.overview)
    },
    getOrderTrend: () => {
      if (!USE_MOCK) return null
      return delay(mockStatistics.orderTrend)
    },
    getDeviceStatus: () => {
      if (!USE_MOCK) return null
      return delay(mockStatistics.deviceStatus)
    },
    getRegionData: () => {
      if (!USE_MOCK) return null
      return delay(mockStatistics.regionData)
    },
  },
}

export default mockApi
