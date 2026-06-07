import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';
import { Region } from '@/entities/region.entity';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
    @InjectRepository(Region) private regionRepository: Repository<Region>,
  ) {}

  async getDashboard() {
    try {
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
        todayAmountResult,
        pendingRepairs,
        lowStockDevices,
      ] = await Promise.all([
        this.pointRepository.count().catch(() => 0),
        this.deviceRepository.count().catch(() => 0),
        this.deviceRepository.count({ where: { status: 'online' } }).catch(() => 0),
        this.deviceRepository.count({ where: { status: 'offline' } }).catch(() => 0),
        this.deviceRepository.count({ where: { status: 'fault' } }).catch(() => 0),
        this.orderRepository.count({ where: { createdAt: Between(today, tomorrow) } }).catch(() => 0),
        this.orderRepository
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.amount), 0)', 'sum')
          .where('order.created_at >= :today', { today })
          .andWhere('order.created_at < :tomorrow', { tomorrow })
          .getRawOne()
          .then((res) => Number(res?.sum) || 0)
          .catch((e) => {
            this.logger.error('todayAmount error:', e);
            return 0;
          }),
        this.repairRepository.count({ where: { status: In(['pending', 'processing']) } }).catch(() => 0),
        this.deviceRepository
          .createQueryBuilder('device')
          .where('device.capacity > 0')
          .andWhere('device.current_stock * 100 < device.capacity * 30')
          .getCount()
          .catch((e) => {
            this.logger.error('lowStockDevices error:', e);
            return 0;
          }),
      ]);

      return {
        totalPoints: totalPoints ?? 0,
        totalDevices: totalDevices ?? 0,
        onlineDevices: onlineDevices ?? 0,
        offlineDevices: offlineDevices ?? 0,
        faultDevices: faultDevices ?? 0,
        todayOrders: todayOrdersCount ?? 0,
        todayAmount: todayAmountResult ?? 0,
        pendingRepairs: pendingRepairs ?? 0,
        lowStockDevices: lowStockDevices ?? 0,
      };
    } catch (error) {
      this.logger.error('getDashboard error:', error);
      return {
        totalPoints: 0,
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        faultDevices: 0,
        todayOrders: 0,
        todayAmount: 0,
        pendingRepairs: 0,
        lowStockDevices: 0,
      };
    }
  }

  async getTrend(days: number = 7) {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);

      const orders = await this.orderRepository
        .find({
          where: { createdAt: Between(startDate, endDate) },
          select: ['createdAt', 'amount'],
        })
        .catch(() => []);

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
    } catch (error) {
      this.logger.error('getTrend error:', error);
      const dates: string[] = [];
      const counts: number[] = [];
      const amounts: number[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        dates.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        counts.push(0);
        amounts.push(0);
      }
      return { dates, counts, amounts };
    }
  }

  async getDeviceStatus() {
    try {
      const [online, offline, fault, maintenance] = await Promise.all([
        this.deviceRepository.count({ where: { status: 'online' } }).catch(() => 0),
        this.deviceRepository.count({ where: { status: 'offline' } }).catch(() => 0),
        this.deviceRepository.count({ where: { status: 'fault' } }).catch(() => 0),
        this.deviceRepository.count({ where: { status: 'maintenance' } }).catch(() => 0),
      ]);

      return [
        { name: '在线', value: online ?? 0, color: '#52C41A' },
        { name: '离线', value: offline ?? 0, color: '#8C8C8C' },
        { name: '故障', value: fault ?? 0, color: '#F5222D' },
        { name: '维护中', value: maintenance ?? 0, color: '#FAAD14' },
      ];
    } catch (error) {
      this.logger.error('getDeviceStatus error:', error);
      return [
        { name: '在线', value: 0, color: '#52C41A' },
        { name: '离线', value: 0, color: '#8C8C8C' },
        { name: '故障', value: 0, color: '#F5222D' },
        { name: '维护中', value: 0, color: '#FAAD14' },
      ];
    }
  }

  async getRegionData() {
    try {
      const allRegions = await this.regionRepository.find().catch(() => []);
      const allPoints = await this.pointRepository.find().catch(() => []);
      const allDevices = await this.deviceRepository.find().catch(() => []);
      const allOrders = await this.orderRepository.find().catch(() => []);

      const getChildRegionIds = (parentId: number, regions: any[]): number[] => {
        const ids: number[] = [];
        const children = regions.filter((r) => r.parentId === parentId);
        for (const child of children) {
          ids.push(child.id);
          ids.push(...getChildRegionIds(child.id, regions));
        }
        return ids;
      };

      const topRegions = allRegions
        .filter((r) => r.level === 1)
        .map((region) => {
          const regionIds = [region.id, ...getChildRegionIds(region.id, allRegions)];
          const regionPoints = allPoints.filter((p) => regionIds.includes(p.regionId));
          const pointIds = regionPoints.map((p) => p.id);
          const regionDevices = allDevices.filter((d) => pointIds.includes(d.pointId));
          const regionOrders = allOrders.filter((o) => pointIds.includes(o.pointId));

          return {
            name: region.name,
            points: regionPoints.length,
            devices: regionDevices.length,
            orders: regionOrders.length,
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

      return topRegions;
    } catch (error) {
      this.logger.error('getRegionData error:', error);
      return [];
    }
  }
}
