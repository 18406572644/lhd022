import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('device')
export class Device {
  @ApiProperty({ description: '设备ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '设备编号' })
  @Column({ unique: true, length: 50 })
  deviceNo: string;

  @ApiProperty({ description: 'SN码' })
  @Column({ unique: true, length: 100 })
  snCode: string;

  @ApiProperty({ description: '设备类型：umbrella-雨伞，charger-充电宝' })
  @Column({ length: 20 })
  type: string;

  @ApiProperty({ description: '点位ID' })
  @Column()
  pointId: number;

  @ApiProperty({ description: '容量' })
  @Column({ default: 0 })
  capacity: number;

  @ApiProperty({ description: '当前库存' })
  @Column({ default: 0 })
  currentStock: number;

  @ApiProperty({ description: '状态：online-在线，offline-离线，fault-故障，maintenance-维护中' })
  @Column({ length: 20, default: 'online' })
  status: string;

  @ApiProperty({ description: '投放时间' })
  @Column({ type: 'datetime', nullable: true })
  launchTime: Date;

  @ApiProperty({ description: '租借次数' })
  @Column({ default: 0 })
  rentCount: number;

  @ApiProperty({ description: '设备图片', type: 'array', items: { type: 'string' } })
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
