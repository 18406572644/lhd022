import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('inventory_record')
export class Inventory {
  @ApiProperty({ description: '盘点ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '盘点单号' })
  @Column({ name: 'inventory_no', unique: true, length: 50 })
  inventoryNo: string;

  @ApiProperty({ description: '设备ID' })
  @Column({ name: 'device_id' })
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @Column({ name: 'point_id' })
  pointId: number;

  @ApiProperty({ description: '损耗类型：damage-损坏，lost-丢失，expired-过期，other-其他' })
  @Column({ name: 'loss_type', length: 20 })
  lossType: string;

  @ApiProperty({ description: '损耗原因' })
  @Column({ type: 'text', nullable: true })
  reason: string;

  @ApiProperty({ description: '处理人' })
  @Column({ length: 50 })
  handler: string;

  @ApiProperty({ description: '损耗图片', type: 'array', items: { type: 'string' } })
  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '处理方式：repair-维修，replace-更换，scrap-报废' })
  @Column({ name: 'handle_method', length: 20, nullable: true })
  handleMethod: string;

  @ApiProperty({ description: '状态：pending-待处理，completed-已完成' })
  @Column({ length: 20, default: 'pending' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
