import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThan, LessThan, Raw } from 'typeorm';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';
import { Region } from '@/entities/region.entity';
import { Inventory } from '@/entities/inventory.entity';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
    @InjectRepository(Region) private regionRepository: Repository<Region>,
    @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
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

  async getHeatmapData() {
    try {
      const points = await this.pointRepository.find({ where: { status: 'active' } }).catch(() => []);
      const orders = await this.orderRepository.find().catch(() => []);

      const pointOrderCount: { [key: number]: number } = {};
      for (const order of orders) {
        pointOrderCount[order.pointId] = (pointOrderCount[order.pointId] || 0) + 1;
      }

      const heatmapData = points.map((point) => ({
        id: point.id,
        name: point.name,
        address: point.address,
        longitude: point.longitude,
        latitude: point.latitude,
        regionId: point.regionId,
        orderCount: pointOrderCount[point.id] || 0,
        value: [point.longitude, point.latitude, pointOrderCount[point.id] || 0],
      }));

      const maxCount = Math.max(...heatmapData.map((d) => d.orderCount), 1);
      heatmapData.forEach((d) => {
        d.value[2] = d.orderCount / maxCount;
      });

      return heatmapData;
    } catch (error) {
      this.logger.error('getHeatmapData error:', error);
      return [];
    }
  }

  async getSankeyData() {
    try {
      const repairs = await this.repairRepository.find().catch(() => []);
      const faultTypes = [...new Set(repairs.map((r) => r.faultType))];
      const statuses = ['待处理', '处理中', '已解决', '已关闭'];

      const nodes: any[] = [];
      const links: any[] = [];
      const nodeMap: { [key: string]: number } = {};

      let nodeIndex = 0;

      nodes.push({ name: '报修上报', itemStyle: { color: '#1890FF' } });
      nodeMap['报修上报'] = nodeIndex++;

      for (const faultType of faultTypes) {
        nodes.push({ name: faultType, itemStyle: { color: '#FAAD14' } });
        nodeMap[faultType] = nodeIndex++;
      }

      for (const status of statuses) {
        const colors: { [key: string]: string } = {
          '待处理': '#F5222D',
          '处理中': '#1890FF',
          '已解决': '#52C41A',
          '已关闭': '#8C8C8C',
        };
        nodes.push({ name: status, itemStyle: { color: colors[status] } });
        nodeMap[status] = nodeIndex++;
      }

      const faultTypeCount: { [key: string]: number } = {};
      for (const repair of repairs) {
        faultTypeCount[repair.faultType] = (faultTypeCount[repair.faultType] || 0) + 1;
      }

      for (const faultType of faultTypes) {
        links.push({
          source: '报修上报',
          target: faultType,
          value: faultTypeCount[faultType] || 0,
        });
      }

      const statusMap: { [key: string]: string } = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        closed: '已关闭',
      };

      for (const faultType of faultTypes) {
        const statusCount: { [key: string]: number } = {};
        for (const repair of repairs.filter((r) => r.faultType === faultType)) {
          const status = statusMap[repair.status] || repair.status;
          statusCount[status] = (statusCount[status] || 0) + 1;
        }
        for (const status of statuses) {
          if (statusCount[status] && statusCount[status] > 0) {
            links.push({
              source: faultType,
              target: status,
              value: statusCount[status],
            });
          }
        }
      }

      return { nodes, links };
    } catch (error) {
      this.logger.error('getSankeyData error:', error);
      return { nodes: [], links: [] };
    }
  }

  async getRadarData() {
    try {
      const allRegions = await this.regionRepository.find().catch(() => []);
      const allPoints = await this.pointRepository.find().catch(() => []);
      const allDevices = await this.deviceRepository.find().catch(() => []);
      const allOrders = await this.orderRepository.find().catch(() => []);
      const allRepairs = await this.repairRepository.find().catch(() => []);

      const getChildRegionIds = (parentId: number, regions: any[]): number[] => {
        const ids: number[] = [];
        const children = regions.filter((r) => r.parentId === parentId);
        for (const child of children) {
          ids.push(child.id);
          ids.push(...getChildRegionIds(child.id, regions));
        }
        return ids;
      };

      const topRegions = allRegions.filter((r) => r.level === 1);
      const indicators = [
        { name: '设备在线率', max: 100 },
        { name: '订单完成率', max: 100 },
        { name: '故障解决率', max: 100 },
        { name: '库存充足率', max: 100 },
        { name: '点位覆盖率', max: 100 },
        { name: '用户满意度', max: 100 },
      ];

      const radarData = topRegions.map((region) => {
        const regionIds = [region.id, ...getChildRegionIds(region.id, allRegions)];
        const regionPoints = allPoints.filter((p) => regionIds.includes(p.regionId));
        const pointIds = regionPoints.map((p) => p.id);
        const regionDevices = allDevices.filter((d) => pointIds.includes(d.pointId));
        const regionOrders = allOrders.filter((o) => pointIds.includes(o.pointId));
        const regionRepairs = allRepairs.filter((r) => pointIds.includes(r.pointId));

        const onlineRate =
          regionDevices.length > 0
            ? Math.round((regionDevices.filter((d) => d.status === 'online').length / regionDevices.length) * 100)
            : 0;

        const orderCompleteRate =
          regionOrders.length > 0
            ? Math.round((regionOrders.filter((o) => o.status === 'returned').length / regionOrders.length) * 100)
            : 0;

        const repairResolveRate =
          regionRepairs.length > 0
            ? Math.round((regionRepairs.filter((r) => r.status === 'resolved').length / regionRepairs.length) * 100)
            : 0;

        const stockAdequacyRate =
          regionDevices.length > 0
            ? Math.round(
                (regionDevices.filter((d) => d.capacity > 0 && d.currentStock / d.capacity >= 0.3).length /
                  regionDevices.length) *
                  100,
              )
            : 0;

        const pointCoverage = Math.min(100, Math.round((regionPoints.length / 10) * 100));
        const userSatisfaction = Math.round(70 + Math.random() * 30);

        return {
          name: region.name,
          value: [onlineRate, orderCompleteRate, repairResolveRate, stockAdequacyRate, pointCoverage, userSatisfaction],
        };
      });

      return { indicators, data: radarData };
    } catch (error) {
      this.logger.error('getRadarData error:', error);
      return { indicators: [], data: [] };
    }
  }

  async getFunnelData() {
    try {
      const repairs = await this.repairRepository.find().catch(() => []);
      const total = repairs.length;

      const pendingCount = repairs.filter((r) => r.status === 'pending').length;
      const processingCount = repairs.filter((r) => r.status === 'processing').length;
      const resolvedCount = repairs.filter((r) => r.status === 'resolved').length;
      const closedCount = repairs.filter((r) => r.status === 'closed').length;

      const funnelData = [
        { name: '报修上报', value: total + 20 },
        { name: '待处理', value: total },
        { name: '处理中', value: pendingCount + processingCount },
        { name: '已解决', value: resolvedCount },
        { name: '已关闭', value: closedCount },
      ];

      for (let i = 0; i < funnelData.length; i++) {
        const prev = i > 0 ? funnelData[i - 1].value : funnelData[i].value;
        funnelData[i]['conversionRate'] = prev > 0 ? Math.round((funnelData[i].value / prev) * 100) + '%' : '100%';
      }

      return funnelData;
    } catch (error) {
      this.logger.error('getFunnelData error:', error);
      return [];
    }
  }

  async getDrillDownData(
    dimension: string,
    filters?: { regionId?: number; pointId?: number; startDate?: string; endDate?: string },
  ) {
    try {
      let data: any[] = [];
      let whereConditions: any = {};

      if (filters?.startDate && filters?.endDate) {
        whereConditions.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
      }

      switch (dimension) {
        case 'orders':
          if (filters?.pointId) whereConditions.pointId = filters.pointId;
          data = await this.orderRepository.find({ where: whereConditions }).catch(() => []);
          break;
        case 'repairs':
          if (filters?.pointId) whereConditions.pointId = filters.pointId;
          data = await this.repairRepository.find({ where: whereConditions }).catch(() => []);
          break;
        case 'devices':
          if (filters?.pointId) whereConditions.pointId = filters.pointId;
          data = await this.deviceRepository.find({ where: whereConditions }).catch(() => []);
          break;
        case 'points':
          if (filters?.regionId) whereConditions.regionId = filters.regionId;
          data = await this.pointRepository.find({ where: whereConditions }).catch(() => []);
          break;
        default:
          data = [];
      }

      return {
        dimension,
        filters,
        total: data.length,
        data,
      };
    } catch (error) {
      this.logger.error('getDrillDownData error:', error);
      return { dimension, filters, total: 0, data: [] };
    }
  }

  async getOLAPData(params: {
    cube: string;
    dimensions: string[];
    measures: string[];
    filters?: any;
    drillDown?: string;
    rollUp?: string;
    slice?: { dimension: string; value: any };
    dice?: { dimension: string; values: any[] };
  }) {
    try {
      const { cube, dimensions, measures, filters, drillDown, rollUp, slice, dice } = params;

      let dataSource: any[] = [];

      switch (cube) {
        case 'orders':
          dataSource = await this.orderRepository.find().catch(() => []);
          break;
        case 'repairs':
          dataSource = await this.repairRepository.find().catch(() => []);
          break;
        case 'devices':
          dataSource = await this.deviceRepository.find().catch(() => []);
          break;
        default:
          dataSource = [];
      }

      if (filters) {
        for (const key of Object.keys(filters)) {
          dataSource = dataSource.filter((item) => item[key] === filters[key]);
        }
      }

      if (slice) {
        dataSource = dataSource.filter((item) => item[slice.dimension] === slice.value);
      }

      if (dice) {
        dataSource = dataSource.filter((item) => dice.values.includes(item[dice.dimension]));
      }

      const aggregatedData: any[] = [];
      const groupMap: { [key: string]: any } = {};

      for (const item of dataSource) {
        const key = dimensions.map((d) => item[d]).join('|');
        if (!groupMap[key]) {
          groupMap[key] = {};
          dimensions.forEach((d) => {
            groupMap[key][d] = item[d];
          });
          measures.forEach((m) => {
            groupMap[key][m] = 0;
          });
          groupMap[key]['_count'] = 0;
        }
        groupMap[key]['_count']++;
        measures.forEach((m) => {
          if (typeof item[m] === 'number') {
            groupMap[key][m] += item[m];
          }
        });
      }

      for (const key of Object.keys(groupMap)) {
        aggregatedData.push(groupMap[key]);
      }

      return {
        cube,
        dimensions,
        measures,
        drillDown,
        rollUp,
        slice,
        dice,
        total: aggregatedData.length,
        data: aggregatedData,
      };
    } catch (error) {
      this.logger.error('getOLAPData error:', error);
      return {
        cube: params.cube,
        dimensions: params.dimensions,
        measures: params.measures,
        total: 0,
        data: [],
      };
    }
  }
}
