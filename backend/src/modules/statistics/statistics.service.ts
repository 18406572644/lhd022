import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';
import { Region } from '@/entities/region.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
    @InjectRepository(Region) private regionRepository: Repository<Region>,
  ) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPoints,
      totalDevices,
      onlineDevices,
      offlineDevices,
      faultDevices,
      todayOrdersCount,
      todayAmount,
      pendingRepairs,
      lowStockDevices,
    ] = await Promise.all([
      this.pointRepository.count(),
      this.deviceRepository.count(),
      this.deviceRepository.count({ where: { status: 'online' } }),
      this.deviceRepository.count({ where: { status: 'offline' } }),
      this.deviceRepository.count({ where: { status: 'fault' } }),
      this.orderRepository.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.amount), 0)', 'sum')
        .where('order.createdAt >= :today', { today })
        .andWhere('order.createdAt < :tomorrow', { tomorrow })
        .getRawOne()
        .then((res) => Number(res.sum) || 0),
      this.repairRepository.count({ where: { status: Raw((alias) => `${alias} IN (:...statuses)`, { statuses: ['pending', 'processing'] }) } }),
      this.deviceRepository
        .createQueryBuilder('device')
        .where('device.capacity > 0')
        .andWhere('device.currentStock / device.capacity < 0.3')
        .getCount(),
    ]);

    return {
      totalPoints,
      totalDevices,
      onlineDevices,
      offlineDevices,
      faultDevices,
      todayOrders: todayOrdersCount,
      todayAmount,
      pendingRepairs,
      lowStockDevices,
    };
  }

  async getTrend(days: number = 7) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.orderRepository.find({
      where: { createdAt: Between(startDate, endDate) },
      select: ['createdAt', 'amount'],
    });

    const dateMap: { [key: string]: { date: string; orders: number; income: number } } = {};
    const dates: string[] = [];
    const counts: number[] = [];
    const amounts: number[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateMap[dateStr] = { date: displayDate, orders: 0, income: 0 };
    }

    for (const order of orders) {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].orders++;
        dateMap[dateStr].income += Number(order.amount || 0);
      }
    }

    const sortedDates = Object.keys(dateMap).sort();
    for (const dateStr of sortedDates) {
      dates.push(dateMap[dateStr].date);
      counts.push(dateMap[dateStr].orders);
      amounts.push(dateMap[dateStr].income);
    }

    return {
      dates,
      counts,
      amounts,
    };
  }

  async getDeviceStatus() {
    const [online, offline, fault, maintenance] = await Promise.all([
      this.deviceRepository.count({ where: { status: 'online' } }),
      this.deviceRepository.count({ where: { status: 'offline' } }),
      this.deviceRepository.count({ where: { status: 'fault' } }),
      this.deviceRepository.count({ where: { status: 'maintenance' } }),
    ]);

    return [
      { name: '在线', value: online, color: '#52C41A' },
      { name: '离线', value: offline, color: '#8C8C8C' },
      { name: '故障', value: fault, color: '#F5222D' },
      { name: '维护中', value: maintenance, color: '#FAAD14' },
    ];
  }

  async getRegionData() {
    const topRegions = await this.regionRepository
      .createQueryBuilder('region')
      .leftJoin(Point, 'point', 'point.regionId = region.id')
      .leftJoin(Device, 'device', 'device.pointId = point.id')
      .leftJoin(Order, 'order', 'order.pointId = point.id')
      .where('region.level = :level', { level: 1 })
      .select('region.name', 'name')
      .addSelect('COUNT(DISTINCT point.id)', 'points')
      .addSelect('COUNT(DISTINCT device.id)', 'devices')
      .addSelect('COUNT(DISTINCT order.id)', 'orders')
      .groupBy('region.id')
      .orderBy('points', 'DESC')
      .limit(5)
      .getRawMany();

    return topRegions.map((r) => ({
      name: r.name,
      points: Number(r.points) || 0,
      devices: Number(r.devices) || 0,
      orders: Number(r.orders) || 0,
    }));
  }
}
