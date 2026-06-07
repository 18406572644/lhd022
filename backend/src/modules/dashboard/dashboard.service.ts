import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from '@/entities/dashboard.entity';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Dashboard) private dashboardRepository: Repository<Dashboard>,
  ) {}

  async create(userId: string, createDto: CreateDashboardDto) {
    const existing = await this.dashboardRepository.findOne({
      where: { name: createDto.name, userId },
    });
    if (existing) {
      throw new ConflictException('仪表盘名称已存在');
    }

    const dashboard = this.dashboardRepository.create({
      ...createDto,
      userId,
      status: 'active',
    });

    return await this.dashboardRepository.save(dashboard);
  }

  async findAll(userId: string) {
    const [personal, publicDashboards] = await Promise.all([
      this.dashboardRepository.find({
        where: { userId, status: 'active' },
        order: { sort: 'ASC', createdAt: 'DESC' },
      }),
      this.dashboardRepository.find({
        where: { isPublic: true, status: 'active' },
        order: { sort: 'ASC', createdAt: 'DESC' },
      }),
    ]);

    const publicFiltered = publicDashboards.filter((d) => d.userId !== userId);
    return [...personal, ...publicFiltered];
  }

  async findOne(id: number, userId: string) {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException('仪表盘不存在');
    }
    if (!dashboard.isPublic && dashboard.userId !== userId) {
      throw new NotFoundException('仪表盘不存在或无权限访问');
    }
    return dashboard;
  }

  async update(id: number, userId: string, updateDto: UpdateDashboardDto) {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException('仪表盘不存在');
    }
    if (dashboard.userId !== userId) {
      throw new NotFoundException('无权限修改此仪表盘');
    }

    if (updateDto.name && updateDto.name !== dashboard.name) {
      const existing = await this.dashboardRepository.findOne({
        where: { name: updateDto.name, userId },
      });
      if (existing) {
        throw new ConflictException('仪表盘名称已存在');
      }
    }

    Object.assign(dashboard, updateDto);
    return await this.dashboardRepository.save(dashboard);
  }

  async remove(id: number, userId: string) {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException('仪表盘不存在');
    }
    if (dashboard.userId !== userId) {
      throw new NotFoundException('无权限删除此仪表盘');
    }

    return await this.dashboardRepository.remove(dashboard);
  }

  async getDefaultWidgets() {
    return [
      { id: 'stat-total-points', type: 'stat-card', title: '点位总数', dataKey: 'totalPoints', icon: 'EnvironmentOutlined', color: '#1890FF' },
      { id: 'stat-total-devices', type: 'stat-card', title: '设备总数', dataKey: 'totalDevices', icon: 'MonitorOutlined', color: '#722ED1' },
      { id: 'stat-online-devices', type: 'stat-card', title: '在线设备', dataKey: 'onlineDevices', icon: 'MonitorOutlined', color: '#52C41A' },
      { id: 'stat-today-orders', type: 'stat-card', title: '今日订单', dataKey: 'todayOrders', icon: 'ShoppingOutlined', color: '#FF7A45' },
      { id: 'stat-today-amount', type: 'stat-card', title: '今日收入', dataKey: 'todayAmount', icon: 'DollarOutlined', color: '#FAAD14', prefix: '¥' },
      { id: 'stat-pending-repairs', type: 'stat-card', title: '待处理报修', dataKey: 'pendingRepairs', icon: 'WarningOutlined', color: '#F5222D' },
      { id: 'stat-low-stock', type: 'stat-card', title: '低库存预警', dataKey: 'lowStockDevices', icon: 'WarningOutlined', color: '#F5222D' },
      { id: 'chart-order-trend', type: 'line', title: '订单趋势', dataSource: 'trend', height: 350 },
      { id: 'chart-device-status', type: 'pie', title: '设备状态分布', dataSource: 'device-status', height: 350 },
      { id: 'chart-region-data', type: 'bar', title: '区域数据对比', dataSource: 'region-data', height: 350 },
      { id: 'chart-heatmap', type: 'heatmap', title: '点位订单热力图', dataSource: 'heatmap', height: 400 },
      { id: 'chart-sankey', type: 'sankey', title: '故障流转路径', dataSource: 'sankey', height: 400 },
      { id: 'chart-radar', type: 'radar', title: '区域运维KPI', dataSource: 'radar', height: 350 },
      { id: 'chart-funnel', type: 'funnel', title: '报修处理漏斗', dataSource: 'funnel', height: 350 },
    ];
  }
}
