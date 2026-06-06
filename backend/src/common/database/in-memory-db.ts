import * as bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Region {
  id: number;
  name: string;
  parentId: number;
  level: number;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Point {
  id: number;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  regionId: number;
  manager: string;
  phone: string;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: number;
  deviceNo: string;
  snCode: string;
  type: string;
  pointId: number;
  capacity: number;
  currentStock: number;
  status: string;
  launchTime: Date;
  rentCount: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Repair {
  id: number;
  repairNo: string;
  deviceId: number;
  pointId: number;
  faultType: string;
  description: string;
  images: string[];
  priority: string;
  status: string;
  reporter: string;
  handler: string;
  reportTime: Date;
  resolveTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restock {
  id: number;
  restockNo: string;
  pointId: number;
  deviceId: number;
  type: string;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  operator: string;
  images: string[];
  remark: string;
  createdAt: Date;
}

export interface Order {
  id: number;
  orderNo: string;
  userId: string;
  deviceId: number;
  pointId: number;
  type: string;
  rentTime: Date;
  returnTime: Date;
  duration: number;
  amount: number;
  status: string;
  createdAt: Date;
}

export interface Inventory {
  id: number;
  inventoryNo: string;
  deviceId: number;
  pointId: number;
  lossType: string;
  reason: string;
  handler: string;
  images: string[];
  handleMethod: string;
  status: string;
  createdAt: Date;
}

class InMemoryDatabase {
  private users: User[] = [];
  private regions: Region[] = [];
  private points: Point[] = [];
  private devices: Device[] = [];
  private repairs: Repair[] = [];
  private restocks: Restock[] = [];
  private orders: Order[] = [];
  private inventory: Inventory[] = [];
  private counters: Record<string, number> = {};

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    this.users = [
      { id: 1, username: 'admin', password: hashedPassword, name: '系统管理员', role: 'admin', phone: '13800138000', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, username: 'supervisor', password: hashedPassword, name: '张主管', role: 'supervisor', phone: '13800138001', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, username: 'operator1', password: hashedPassword, name: '李运维', role: 'operator', phone: '13800138002', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    this.regions = [
      { id: 1, name: '华东区', parentId: 0, level: 1, sort: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: '华南区', parentId: 0, level: 1, sort: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: '华北区', parentId: 0, level: 1, sort: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: '上海市', parentId: 1, level: 2, sort: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: '杭州市', parentId: 1, level: 2, sort: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: '广州市', parentId: 2, level: 2, sort: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: '深圳市', parentId: 2, level: 2, sort: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: '北京市', parentId: 3, level: 2, sort: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: '浦东新区', parentId: 4, level: 3, sort: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: '黄浦区', parentId: 4, level: 3, sort: 2, createdAt: new Date(), updatedAt: new Date() },
    ];

    this.points = [
      { id: 1, name: '陆家嘴地铁站', address: '上海市浦东新区陆家嘴地铁站B1层', longitude: 121.5049, latitude: 31.2397, regionId: 9, manager: '张经理', phone: '13900000001', images: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: '人民广场站', address: '上海市黄浦区人民广场地铁站', longitude: 121.4737, latitude: 31.2304, regionId: 10, manager: '李经理', phone: '13900000002', images: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: '西湖文化广场', address: '杭州市西湖区文化广场入口', longitude: 120.1551, latitude: 30.2741, regionId: 5, manager: '王经理', phone: '13900000003', images: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: '广州南站', address: '广州市番禺区广州南站候车厅', longitude: 113.2644, latitude: 23.1291, regionId: 6, manager: '赵经理', phone: '13900000004', images: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: '深圳北站', address: '深圳市龙华区深圳北站', longitude: 114.0579, latitude: 22.5431, regionId: 7, manager: '刘经理', phone: '13900000005', images: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: '北京站', address: '北京市东城区北京站', longitude: 116.4074, latitude: 39.9042, regionId: 8, manager: '陈经理', phone: '13900000006', images: [], status: 'maintenance', createdAt: new Date(), updatedAt: new Date() },
    ];

    this.devices = [
      { id: 1, deviceNo: 'UMB001', snCode: 'SN20240001', type: 'umbrella', pointId: 1, capacity: 20, currentStock: 15, status: 'online', launchTime: new Date('2024-01-15'), rentCount: 156, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 2, deviceNo: 'UMB002', snCode: 'SN20240002', type: 'umbrella', pointId: 2, capacity: 20, currentStock: 8, status: 'online', launchTime: new Date('2024-01-20'), rentCount: 203, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 3, deviceNo: 'CHG001', snCode: 'SN20240003', type: 'charger', pointId: 1, capacity: 12, currentStock: 5, status: 'online', launchTime: new Date('2024-02-01'), rentCount: 312, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 4, deviceNo: 'CHG002', snCode: 'SN20240004', type: 'charger', pointId: 3, capacity: 12, currentStock: 10, status: 'online', launchTime: new Date('2024-02-10'), rentCount: 178, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 5, deviceNo: 'UMB003', snCode: 'SN20240005', type: 'umbrella', pointId: 4, capacity: 20, currentStock: 18, status: 'online', launchTime: new Date('2024-02-15'), rentCount: 89, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 6, deviceNo: 'CHG003', snCode: 'SN20240006', type: 'charger', pointId: 5, capacity: 12, currentStock: 3, status: 'online', launchTime: new Date('2024-02-20'), rentCount: 267, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 7, deviceNo: 'UMB004', snCode: 'SN20240007', type: 'umbrella', pointId: 6, capacity: 20, currentStock: 0, status: 'maintenance', launchTime: new Date('2024-03-01'), rentCount: 124, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 8, deviceNo: 'CHG004', snCode: 'SN20240008', type: 'charger', pointId: 2, capacity: 12, currentStock: 12, status: 'offline', launchTime: new Date('2024-03-10'), rentCount: 45, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 9, deviceNo: 'UMB005', snCode: 'SN20240009', type: 'umbrella', pointId: 3, capacity: 20, currentStock: 12, status: 'fault', launchTime: new Date('2024-03-15'), rentCount: 78, images: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 10, deviceNo: 'CHG005', snCode: 'SN20240010', type: 'charger', pointId: 4, capacity: 12, currentStock: 7, status: 'online', launchTime: new Date('2024-03-20'), rentCount: 134, images: [], createdAt: new Date(), updatedAt: new Date() },
    ];

    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const rentTime = new Date(date);
      rentTime.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      const returnTime = new Date(rentTime);
      returnTime.setMinutes(returnTime.getMinutes() + 30 + Math.floor(Math.random() * 180));
      const duration = Math.floor((returnTime.getTime() - rentTime.getTime()) / 60000);
      const amount = Math.ceil(duration / 30) * 2;

      this.orders.push({
        id: i,
        orderNo: `ORD${String(i).padStart(6, '0')}`,
        userId: `USER${String(1000 + i).padStart(4, '0')}`,
        deviceId: Math.floor(Math.random() * 6) + 1,
        pointId: Math.floor(Math.random() * 5) + 1,
        type: Math.random() > 0.5 ? 'umbrella' : 'charger',
        rentTime,
        returnTime,
        duration,
        amount,
        status: i < 28 ? 'returned' : (i < 29 ? 'renting' : (i < 30 ? 'overdue' : 'lost')),
        createdAt: new Date(),
      });
    }

    this.repairs = [
      { id: 1, repairNo: 'REP20240601001', deviceId: 9, pointId: 3, faultType: '硬件故障', description: '设备屏幕不亮，无法扫码租借', images: [], priority: 'high', status: 'processing', reporter: '李运维', handler: '张主管', reportTime: new Date('2024-06-01T10:30:00'), resolveTime: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, repairNo: 'REP20240602001', deviceId: 8, pointId: 2, faultType: '网络异常', description: '设备离线，无法连接服务器', images: [], priority: 'medium', status: 'pending', reporter: '王运维', handler: '', reportTime: new Date('2024-06-02T14:20:00'), resolveTime: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, repairNo: 'REP20240530001', deviceId: 7, pointId: 6, faultType: '锁具故障', description: '部分锁具无法正常弹出', images: [], priority: 'urgent', status: 'resolved', reporter: '李运维', handler: '张主管', reportTime: new Date('2024-05-30T09:15:00'), resolveTime: new Date('2024-05-31T16:00:00'), createdAt: new Date(), updatedAt: new Date() },
    ];

    this.restocks = [
      { id: 1, restockNo: 'RS20240603001', pointId: 2, deviceId: 2, type: 'umbrella', quantity: 10, beforeStock: 5, afterStock: 15, operator: '李运维', images: [], remark: '雨天前补货', createdAt: new Date('2024-06-03T08:30:00') },
      { id: 2, restockNo: 'RS20240602001', pointId: 5, deviceId: 6, type: 'charger', quantity: 5, beforeStock: 2, afterStock: 7, operator: '王运维', images: [], remark: '周末高峰补货', createdAt: new Date('2024-06-02T10:00:00') },
      { id: 3, restockNo: 'RS20240601001', pointId: 1, deviceId: 1, type: 'umbrella', quantity: 8, beforeStock: 7, afterStock: 15, operator: '李运维', images: [], remark: '日常补货', createdAt: new Date('2024-06-01T15:30:00') },
    ];

    this.inventory = [
      { id: 1, inventoryNo: 'INV20240501', deviceId: 9, pointId: 3, lossType: 'damage', reason: '设备外壳破损，内部电路板损坏', handler: '张主管', images: [], handleMethod: 'scrap', status: 'completed', createdAt: new Date('2024-05-15') },
      { id: 2, inventoryNo: 'INV20240502', deviceId: 7, pointId: 6, lossType: 'expired', reason: '设备使用年限超过3年，电池老化', handler: '张主管', images: [], handleMethod: 'replace', status: 'completed', createdAt: new Date('2024-05-20') },
      { id: 3, inventoryNo: 'INV20240601', deviceId: 3, pointId: 1, lossType: 'lost', reason: '充电宝丢失，追踪不到位置', handler: '张主管', images: [], handleMethod: 'scrap', status: 'pending', createdAt: new Date('2024-06-01') },
    ];

    this.counters = {
      user: 3,
      region: 10,
      point: 6,
      device: 10,
      repair: 3,
      restock: 3,
      order: 30,
      inventory: 3,
    };
  }

  nextId(table: string): number {
    this.counters[table] = (this.counters[table] || 0) + 1;
    return this.counters[table];
  }

  getUsers(): User[] { return this.users; }
  getRegions(): Region[] { return this.regions; }
  getPoints(): Point[] { return this.points; }
  getDevices(): Device[] { return this.devices; }
  getRepairs(): Repair[] { return this.repairs; }
  getRestocks(): Restock[] { return this.restocks; }
  getOrders(): Order[] { return this.orders; }
  getInventory(): Inventory[] { return this.inventory; }

  addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = { ...user, id: this.nextId('user'), createdAt: new Date(), updatedAt: new Date() };
    this.users.push(newUser);
    return newUser;
  }

  addRegion(region: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>): Region {
    const newRegion: Region = { ...region, id: this.nextId('region'), createdAt: new Date(), updatedAt: new Date() };
    this.regions.push(newRegion);
    return newRegion;
  }

  addPoint(point: Omit<Point, 'id' | 'createdAt' | 'updatedAt'>): Point {
    const newPoint: Point = { ...point, id: this.nextId('point'), createdAt: new Date(), updatedAt: new Date() };
    this.points.push(newPoint);
    return newPoint;
  }

  addDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Device {
    const newDevice: Device = { ...device, id: this.nextId('device'), createdAt: new Date(), updatedAt: new Date() };
    this.devices.push(newDevice);
    return newDevice;
  }

  addRepair(repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'>): Repair {
    const newRepair: Repair = { ...repair, id: this.nextId('repair'), createdAt: new Date(), updatedAt: new Date() };
    this.repairs.push(newRepair);
    return newRepair;
  }

  addRestock(restock: Omit<Restock, 'id' | 'createdAt'>): Restock {
    const newRestock: Restock = { ...restock, id: this.nextId('restock'), createdAt: new Date() };
    this.restocks.push(newRestock);
    return newRestock;
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = { ...order, id: this.nextId('order'), createdAt: new Date() };
    this.orders.push(newOrder);
    return newOrder;
  }

  addInventory(item: Omit<Inventory, 'id' | 'createdAt'>): Inventory {
    const newItem: Inventory = { ...item, id: this.nextId('inventory'), createdAt: new Date() };
    this.inventory.push(newItem);
    return newItem;
  }

  updateUser(id: number, data: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  updateRegion(id: number, data: Partial<Region>): Region | null {
    const index = this.regions.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.regions[index] = { ...this.regions[index], ...data, updatedAt: new Date() };
    return this.regions[index];
  }

  updatePoint(id: number, data: Partial<Point>): Point | null {
    const index = this.points.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.points[index] = { ...this.points[index], ...data, updatedAt: new Date() };
    return this.points[index];
  }

  updateDevice(id: number, data: Partial<Device>): Device | null {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.devices[index] = { ...this.devices[index], ...data, updatedAt: new Date() };
    return this.devices[index];
  }

  updateRepair(id: number, data: Partial<Repair>): Repair | null {
    const index = this.repairs.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.repairs[index] = { ...this.repairs[index], ...data, updatedAt: new Date() };
    return this.repairs[index];
  }

  updateInventory(id: number, data: Partial<Inventory>): Inventory | null {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.inventory[index] = { ...this.inventory[index], ...data };
    return this.inventory[index];
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  deleteRegion(id: number): boolean {
    const index = this.regions.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.regions.splice(index, 1);
    return true;
  }

  deletePoint(id: number): boolean {
    const index = this.points.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.points.splice(index, 1);
    return true;
  }

  deleteDevice(id: number): boolean {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.devices.splice(index, 1);
    return true;
  }
}

export const db = new InMemoryDatabase();
