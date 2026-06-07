import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('alert_record')
export class AlertRecord {
  @ApiProperty({ description: '预警记录ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '预警配置ID' })
  @Column({ name: 'config_id' })
  configId: number;

  @ApiProperty({ description: '预警名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '指标类型' })
  @Column({ name: 'metric_type', length: 50 })
  metricType: string;

  @ApiProperty({ description: '当前值' })
  @Column({ name: 'current_value', type: 'float' })
  currentValue: number;

  @ApiProperty({ description: '阈值' })
  @Column({ type: 'float' })
  threshold: number;

  @ApiProperty({ description: '比较运算符' })
  @Column({ length: 10 })
  operator: string;

  @ApiProperty({ description: '预警级别' })
  @Column({ length: 20, default: 'medium' })
  level: string;

  @ApiProperty({ description: '预警消息' })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({ description: '状态：pending-待处理, processing-处理中, resolved-已解决, ignored-已忽略' })
  @Column({ length: 20, default: 'pending' })
  status: string;

  @ApiProperty({ description: '处理人' })
  @Column({ name: 'handler', length: 50, nullable: true })
  handler: string;

  @ApiProperty({ description: '处理备注' })
  @Column({ name: 'handle_remark', type: 'text', nullable: true })
  handleRemark: string;

  @ApiProperty({ description: '处理时间' })
  @Column({ name: 'handle_time', type: 'datetime', nullable: true })
  handleTime: Date;

  @ApiProperty({ description: '通知状态：sent-已发送, failed-发送失败, pending-待发送' })
  @Column({ name: 'notify_status', length: 20, default: 'pending' })
  notifyStatus: string;

  @ApiProperty({ description: '通知结果' })
  @Column({ name: 'notify_result', type: 'text', nullable: true })
  notifyResult: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
