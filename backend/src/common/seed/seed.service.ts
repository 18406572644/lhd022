import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/entities/user.entity';
import { Region } from '@/entities/region.entity';
import { Point } from '@/entities/point.entity';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Restock } from '@/entities/restock.entity';
import { Inventory } from '@/entities/inventory.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Region) private regionRepository: Repository<Region>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(Restock) private restockRepository: Repository<Restock>,
    @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      console.log('开始初始化测试数据...');
      await this.seedRegions();
      await this.seedUsers();
      await this.seedPoints();
      await this.seedDevices();
      await this.seedOrders();
      await this.seedRepairs();
      await this.seedRestocks();
      await this.seedInventory();
      console.log('测试数据初始化完成！');
    }
  }

  private async seedUsers() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users: Partial<User>[] = [
      { username: 'admin', password: hashedPassword, name: '系统管理员', role: 'admin', phone: '13800138000', isActive: true },
      { username: 'supervisor', password: hashedPassword, name: '张主管', role: 'supervisor', phone: '13800138001', isActive: true },
      { username: 'operator1', password: hashedPassword, name: '李运维', role: 'operator', phone: '13800138002', isActive: true },
    ];
    await this.userRepository.save(users);
  }

  private async seedRegions() {
    const regions: Partial<Region>[] = [
      { name: '华东区', parentId: 0, level: 1, sort: 1 },
      { name: '华南区', parentId: 0, level: 1, sort: 2 },
      { name: '华北区', parentId: 0, level: 1, sort: 3 },
      { name: '上海市', parentId: 1, level: 2, sort: 1 },
      { name: '杭州市', parentId: 1, level: 2, sort: 2 },
      { name: '广州市', parentId: 2, level: 2, sort: 1 },
      { name: '深圳市', parentId: 2, level: 2, sort: 2 },
      { name: '北京市', parentId: 3, level: 2, sort: 1 },
      { name: '浦东新区', parentId: 4, level: 3, sort: 1 },
      { name: '黄浦区', parentId: 4, level: 3, sort: 2 },
    ];
    await this.regionRepository.save(regions);
  }

  private async seedPoints() {
    const points: Partial<Point>[] = [
      { name: '陆家嘴地铁站', address: '上海市浦东新区陆家嘴地铁站B1层', longitude: 121.5049, latitude: 31.2397, regionId: 9, manager: '张经理', phone: '13900000001', status: 'active', images: [] },
      { name: '人民广场站', address: '上海市黄浦区人民广场地铁站', longitude: 121.4737, latitude: 31.2304, regionId: 10, manager: '李经理', phone: '13900000002', status: 'active', images: [] },
      { name: '西湖文化广场', address: '杭州市西湖区文化广场入口', longitude: 120.1551, latitude: 30.2741, regionId: 5, manager: '王经理', phone: '13900000003', status: 'active', images: [] },
      { name: '广州南站', address: '广州市番禺区广州南站候车厅', longitude: 113.2644, latitude: 23.1291, regionId: 6, manager: '赵经理', phone: '13900000004', status: 'active', images: [] },
      { name: '深圳北站', address: '深圳市龙华区深圳北站', longitude: 114.0579, latitude: 22.5431, regionId: 7, manager: '刘经理', phone: '13900000005', status: 'active', images: [] },
      { name: '北京站', address: '北京市东城区北京站', longitude: 116.4074, latitude: 39.9042, regionId: 8, manager: '陈经理', phone: '13900000006', status: 'maintenance', images: [] },
    ];
    await this.pointRepository.save(points);
  }

  private async seedDevices() {
    const devices: Partial<Device>[] = [
      { deviceNo: 'UMB001', snCode: 'SN20240001', type: 'umbrella', pointId: 1, capacity: 20, currentStock: 15, status: 'online', launchTime: new Date('2024-01-15'), rentCount: 156, images: [] },
      { deviceNo: 'UMB002', snCode: 'SN20240002', type: 'umbrella', pointId: 2, capacity: 20, currentStock: 8, status: 'online', launchTime: new Date('2024-01-20'), rentCount: 203, images: [] },
      { deviceNo: 'CHG001', snCode: 'SN20240003', type: 'charger', pointId: 1, capacity: 12, currentStock: 5, status: 'online', launchTime: new Date('2024-02-01'), rentCount: 312, images: [] },
      { deviceNo: 'CHG002', snCode: 'SN20240004', type: 'charger', pointId: 3, capacity: 12, currentStock: 10, status: 'online', launchTime: new Date('2024-02-10'), rentCount: 178, images: [] },
      { deviceNo: 'UMB003', snCode: 'SN20240005', type: 'umbrella', pointId: 4, capacity: 20, currentStock: 18, status: 'online', launchTime: new Date('2024-02-15'), rentCount: 89, images: [] },
      { deviceNo: 'CHG003', snCode: 'SN20240006', type: 'charger', pointId: 5, capacity: 12, currentStock: 3, status: 'online', launchTime: new Date('2024-02-20'), rentCount: 267, images: [] },
      { deviceNo: 'UMB004', snCode: 'SN20240007', type: 'umbrella', pointId: 6, capacity: 20, currentStock: 0, status: 'maintenance', launchTime: new Date('2024-03-01'), rentCount: 124, images: [] },
      { deviceNo: 'CHG004', snCode: 'SN20240008', type: 'charger', pointId: 2, capacity: 12, currentStock: 12, status: 'offline', launchTime: new Date('2024-03-10'), rentCount: 45, images: [] },
      { deviceNo: 'UMB005', snCode: 'SN20240009', type: 'umbrella', pointId: 3, capacity: 20, currentStock: 12, status: 'fault', launchTime: new Date('2024-03-15'), rentCount: 78, images: [] },
      { deviceNo: 'CHG005', snCode: 'SN20240010', type: 'charger', pointId: 4, capacity: 12, currentStock: 7, status: 'online', launchTime: new Date('2024-03-20'), rentCount: 134, images: [] },
    ];
    await this.deviceRepository.save(devices);
  }

  private async seedOrders() {
    const orders: Partial<Order>[] = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const rentTime = new Date(date);
      rentTime.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      const returnTime = new Date(rentTime);
      returnTime.setMinutes(returnTime.getMinutes() + 30 + Math.floor(Math.random() * 180));
      const duration = Math.floor((returnTime.getTime() - rentTime.getTime()) / 60000);
      const amount = Math.ceil(duration / 30) * 2;

      orders.push({
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
      });
    }
    await this.orderRepository.save(orders);
  }

  private async seedRepairs() {
    const repairs: Partial<Repair>[] = [
      { repairNo: 'REP20240601001', deviceId: 9, pointId: 3, faultType: '硬件故障', description: '设备屏幕不亮，无法扫码租借', images: [], priority: 'high', status: 'processing', reporter: '李运维', handler: '张主管', reportTime: new Date('2024-06-01 10:30:00') },
      { repairNo: 'REP20240602001', deviceId: 8, pointId: 2, faultType: '网络异常', description: '设备离线，无法连接服务器', images: [], priority: 'medium', status: 'pending', reporter: '王运维', handler: '', reportTime: new Date('2024-06-02 14:20:00') },
      { repairNo: 'REP20240530001', deviceId: 7, pointId: 6, faultType: '锁具故障', description: '部分锁具无法正常弹出', images: [], priority: 'urgent', status: 'resolved', reporter: '李运维', handler: '张主管', reportTime: new Date('2024-05-30 09:15:00'), resolveTime: new Date('2024-05-31 16:00:00') },
    ];
    await this.repairRepository.save(repairs);
  }

  private async seedRestocks() {
    const restocks: Partial<Restock>[] = [
      { restockNo: 'RS20240603001', pointId: 2, deviceId: 2, type: 'umbrella', quantity: 10, beforeStock: 5, afterStock: 15, operator: '李运维', images: [], remark: '雨天前补货', createdAt: new Date('2024-06-03 08:30:00') },
      { restockNo: 'RS20240602001', pointId: 5, deviceId: 6, type: 'charger', quantity: 5, beforeStock: 2, afterStock: 7, operator: '王运维', images: [], remark: '周末高峰补货', createdAt: new Date('2024-06-02 10:00:00') },
      { restockNo: 'RS20240601001', pointId: 1, deviceId: 1, type: 'umbrella', quantity: 8, beforeStock: 7, afterStock: 15, operator: '李运维', images: [], remark: '日常补货', createdAt: new Date('2024-06-01 15:30:00') },
    ];
    await this.restockRepository.save(restocks);
  }

  private async seedInventory() {
    const inventory: Partial<Inventory>[] = [
      { inventoryNo: 'INV20240501', deviceId: 9, pointId: 3, lossType: 'damage', reason: '设备外壳破损，内部电路板损坏', handler: '张主管', images: [], handleMethod: 'scrap', status: 'completed', createdAt: new Date('2024-05-15') },
      { inventoryNo: 'INV20240502', deviceId: 7, pointId: 6, lossType: 'expired', reason: '设备使用年限超过3年，电池老化', handler: '张主管', images: [], handleMethod: 'replace', status: 'completed', createdAt: new Date('2024-05-20') },
      { inventoryNo: 'INV20240601', deviceId: 3, pointId: 1, lossType: 'lost', reason: '充电宝丢失，追踪不到位置', handler: '张主管', images: [], handleMethod: 'scrap', status: 'pending', createdAt: new Date('2024-06-01') },
    ];
    await this.inventoryRepository.save(inventory);
  }
}
