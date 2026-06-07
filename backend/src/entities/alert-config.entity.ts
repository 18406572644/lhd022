import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('alert_config')
export class AlertConfig {
  @ApiProperty({ description: '预警配置ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '预警名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '指标类型：device_online_rate-设备在线率, low_stock-低库存, pending_repair-待处理报修, order_abnormal-订单异常' })
  @Column({ name: 'metric_type', length: 50 })
  metricType: string;

  @ApiProperty({ description: '比较运算符：gt-大于, gte-大于等于, lt-小于, lte-小于等于, eq-等于, ne-不等于' })
  @Column({ name: 'operator', length: 10 })
  operator: string;

  @ApiProperty({ description: '阈值' })
  @Column({ type: 'float' })
  threshold: number;

  @ApiProperty({ description: '预警级别：low-低, medium-中, high-高, urgent-紧急' })
  @Column({ name: 'level', length: 20, default: 'medium' })
  level: string;

  @ApiProperty({ description: '通知方式：system-系统通知, email-邮件, sms-短信' })
  @Column({ type: 'simple-array', nullable: true })
  notifyChannels: string[];

  @ApiProperty({ description: '通知接收人' })
  @Column({ type: 'simple-array', nullable: true })
  receivers: string[];

  @ApiProperty({ description: '检测周期（分钟）' })
  @Column({ name: 'check_interval', default: 60 })
  checkInterval: number;

  @ApiProperty({ description: '静默时间（分钟），避免重复预警' })
  @Column({ name: 'silence_duration', default: 120 })
  silenceDuration: number;

  @ApiProperty({ description: '最近检测时间' })
  @Column({ name: 'last_check_time', type: 'datetime', nullable: true })
  lastCheckTime: Date;

  @ApiProperty({ description: '最近预警时间' })
  @Column({ name: 'last_alert_time', type: 'datetime', nullable: true })
  lastAlertTime: Date;

  @ApiProperty({ description: '是否启用' })
  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @ApiProperty({ description: '创建人' })
  @Column({ name: 'created_by', length: 50, nullable: true })
  createdBy: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
