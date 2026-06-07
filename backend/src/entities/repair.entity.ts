import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('repair')
export class Repair {
  @ApiProperty({ description: '报修ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '报修单号' })
  @Column({ name: 'repair_no', unique: true, length: 50 })
  repairNo: string;

  @ApiProperty({ description: '设备ID' })
  @Column({ name: 'device_id' })
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @Column({ name: 'point_id' })
  pointId: number;

  @ApiProperty({ description: '故障类型' })
  @Column({ name: 'fault_type', length: 50 })
  faultType: string;

  @ApiProperty({ description: '故障描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '故障图片', type: 'array', items: { type: 'string' } })
  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '优先级：low-低，medium-中，high-高，urgent-紧急' })
  @Column({ length: 20, default: 'medium' })
  priority: string;

  @ApiProperty({ description: '状态：pending-待处理，processing-处理中，resolved-已解决，closed-已关闭' })
  @Column({ length: 20, default: 'pending' })
  status: string;

  @ApiProperty({ description: '上报人' })
  @Column({ length: 50, nullable: true })
  reporter: string;

  @ApiProperty({ description: '处理人' })
  @Column({ length: 50, nullable: true })
  handler: string;

  @ApiProperty({ description: '上报时间' })
  @Column({ name: 'report_time', type: 'datetime', nullable: true })
  reportTime: Date;

  @ApiProperty({ description: '解决时间' })
  @Column({ name: 'resolve_time', type: 'datetime', nullable: true })
  resolveTime: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
