import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertConfig } from '@/entities/alert-config.entity';
import { AlertRecord } from '@/entities/alert-record.entity';
import { Device } from '@/entities/device.entity';
import { Repair } from '@/entities/repair.entity';
import { User } from '@/entities/user.entity';
import { CreateAlertConfigDto } from './dto/create-alert-config.dto';
import { UpdateAlertConfigDto } from './dto/update-alert-config.dto';
import { HandleAlertRecordDto } from './dto/handle-alert-record.dto';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(AlertConfig) private alertConfigRepository: Repository<AlertConfig>,
    @InjectRepository(AlertRecord) private alertRecordRepository: Repository<AlertRecord>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createConfig(userId: string, createDto: CreateAlertConfigDto) {
    const config = this.alertConfigRepository.create({
      ...createDto,
      createdBy: userId,
    });
    return await this.alertConfigRepository.save(config);
  }

  async findAllConfigs() {
    return await this.alertConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneConfig(id: number) {
    const config = await this.alertConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('预警配置不存在');
    }
    return config;
  }

  async updateConfig(id: number, updateDto: UpdateAlertConfigDto) {
    const config = await this.findOneConfig(id);
    Object.assign(config, updateDto);
    return await this.alertConfigRepository.save(config);
  }

  async removeConfig(id: number) {
    const config = await this.findOneConfig(id);
    return await this.alertConfigRepository.remove(config);
  }

  async getMetricValue(metricType: string): Promise<number> {
    switch (metricType) {
      case 'device_online_rate': {
        const [total, online] = await Promise.all([
          this.deviceRepository.count(),
          this.deviceRepository.count({ where: { status: 'online' } }),
        ]);
        return total > 0 ? Math.round((online / total) * 100) : 0;
      }
      case 'low_stock': {
        const lowStockCount = await this.deviceRepository
          .createQueryBuilder('device')
          .where('device.capacity > 0')
          .andWhere('device.current_stock * 100 < device.capacity * 30')
          .getCount();
        return lowStockCount;
      }
      case 'pending_repair': {
        return await this.repairRepository.count({
          where: { status: 'pending' },
        });
      }
      case 'fault_devices': {
        return await this.deviceRepository.count({
          where: { status: 'fault' },
        });
      }
      case 'offline_devices': {
        return await this.deviceRepository.count({
          where: { status: 'offline' },
        });
      }
      default:
        return 0;
    }
  }

  compareValue(currentValue: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return currentValue > threshold;
      case 'gte':
        return currentValue >= threshold;
      case 'lt':
        return currentValue < threshold;
      case 'lte':
        return currentValue <= threshold;
      case 'eq':
        return currentValue === threshold;
      case 'ne':
        return currentValue !== threshold;
      default:
        return false;
    }
  }

  async checkAlerts() {
    const enabledConfigs = await this.alertConfigRepository.find({
      where: { isEnabled: true },
    });

    const results: any[] = [];
    const now = new Date();

    for (const config of enabledConfigs) {
      try {
        const currentValue = await this.getMetricValue(config.metricType);
        const shouldAlert = this.compareValue(currentValue, config.operator, config.threshold);

        config.lastCheckTime = now;
        await this.alertConfigRepository.save(config);

        if (shouldAlert) {
          const silenceEndTime = config.lastAlertTime
            ? new Date(config.lastAlertTime.getTime() + config.silenceDuration * 60000)
            : null;

          if (!silenceEndTime || now > silenceEndTime) {
            const record = await this.createAlertRecord(config, currentValue);
            await this.sendNotification(config, record);

            config.lastAlertTime = now;
            await this.alertConfigRepository.save(config);

            results.push({
              configId: config.id,
              configName: config.name,
              metricType: config.metricType,
              currentValue,
              threshold: config.threshold,
              operator: config.operator,
              level: config.level,
              alerted: true,
              recordId: record.id,
            });
          } else {
            results.push({
              configId: config.id,
              configName: config.name,
              metricType: config.metricType,
              currentValue,
              threshold: config.threshold,
              operator: config.operator,
              level: config.level,
              alerted: false,
              reason: '在静默期内',
            });
          }
        } else {
          results.push({
            configId: config.id,
            configName: config.name,
            metricType: config.metricType,
            currentValue,
            threshold: config.threshold,
            operator: config.operator,
            level: config.level,
            alerted: false,
            reason: '指标正常',
          });
        }
      } catch (error) {
        this.logger.error(`Check alert failed for config ${config.id}:`, error);
        results.push({
          configId: config.id,
          configName: config.name,
          metricType: config.metricType,
          alerted: false,
          error: error.message,
        });
      }
    }

    return {
      total: enabledConfigs.length,
      alerted: results.filter((r) => r.alerted).length,
      results,
    };
  }

  async createAlertRecord(config: AlertConfig, currentValue: number) {
    const operatorLabels: { [key: string]: string } = {
      gt: '大于',
      gte: '大于等于',
      lt: '小于',
      lte: '小于等于',
      eq: '等于',
      ne: '不等于',
    };

    const levelLabels: { [key: string]: string } = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };

    const metricLabels: { [key: string]: string } = {
      device_online_rate: '设备在线率',
      low_stock: '低库存设备数',
      pending_repair: '待处理报修数',
      fault_devices: '故障设备数',
      offline_devices: '离线设备数',
    };

    const message = `【${levelLabels[config.level] || config.level}级预警】${config.name}：${metricLabels[config.metricType] || config.metricType} 当前值为 ${currentValue}，${operatorLabels[config.operator] || config.operator} 阈值 ${config.threshold}，请及时处理。`;

    const record = this.alertRecordRepository.create({
      configId: config.id,
      name: config.name,
      metricType: config.metricType,
      currentValue,
      threshold: config.threshold,
      operator: config.operator,
      level: config.level,
      message,
      status: 'pending',
      notifyStatus: 'pending',
    });

    return await this.alertRecordRepository.save(record);
  }

  async sendNotification(config: AlertConfig, record: AlertRecord) {
    try {
      const notifyResult: any[] = [];

      if (config.notifyChannels?.includes('system')) {
        notifyResult.push({
          channel: 'system',
          status: 'sent',
          message: '系统通知已发送',
        });
      }

      if (config.notifyChannels?.includes('email')) {
        const receivers = config.receivers || [];
        if (receivers.length > 0) {
          const users = await this.userRepository.findByIds(receivers.map(Number)).catch(() => []);
          notifyResult.push({
            channel: 'email',
            status: 'sent',
            receivers: users.map((u) => u.name),
            message: `邮件已发送给 ${users.length} 位用户`,
          });
        }
      }

      record.notifyStatus = 'sent';
      record.notifyResult = JSON.stringify(notifyResult);
      await this.alertRecordRepository.save(record);

      return notifyResult;
    } catch (error) {
      this.logger.error('Send notification failed:', error);
      record.notifyStatus = 'failed';
      record.notifyResult = error.message;
      await this.alertRecordRepository.save(record);
      throw error;
    }
  }

  async findAllRecords(params?: {
    status?: string;
    level?: string;
    metricType?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, level, metricType, page = 1, pageSize = 20 } = params || {};
    const where: any = {};

    if (status) where.status = status;
    if (level) where.level = level;
    if (metricType) where.metricType = metricType;

    const [records, total] = await this.alertRecordRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: records,
      total,
      page,
      pageSize,
    };
  }

  async findOneRecord(id: number) {
    const record = await this.alertRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('预警记录不存在');
    }
    return record;
  }

  async handleRecord(id: number, userId: string, handleDto: HandleAlertRecordDto) {
    const record = await this.findOneRecord(id);
    record.status = handleDto.status;
    record.handler = userId;
    record.handleRemark = handleDto.handleRemark;
    record.handleTime = new Date();
    return await this.alertRecordRepository.save(record);
  }

  async getAlertSummary() {
    const records = await this.alertRecordRepository.find();
    const total = records.length;
    const pending = records.filter((r) => r.status === 'pending').length;
    const processing = records.filter((r) => r.status === 'processing').length;
    const resolved = records.filter((r) => r.status === 'resolved').length;
    const ignored = records.filter((r) => r.status === 'ignored').length;

    const levelStats: any = {};
    for (const record of records) {
      if (!levelStats[record.level]) {
        levelStats[record.level] = 0;
      }
      levelStats[record.level]++;
    }

    const recentRecords = records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      total,
      pending,
      processing,
      resolved,
      ignored,
      levelStats,
      recentRecords,
    };
  }

  getAvailableMetrics() {
    return [
      { value: 'device_online_rate', label: '设备在线率(%)', unit: '%' },
      { value: 'low_stock', label: '低库存设备数', unit: '台' },
      { value: 'pending_repair', label: '待处理报修数', unit: '单' },
      { value: 'fault_devices', label: '故障设备数', unit: '台' },
      { value: 'offline_devices', label: '离线设备数', unit: '台' },
    ];
  }
}
