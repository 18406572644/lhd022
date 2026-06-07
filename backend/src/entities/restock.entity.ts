import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('restock')
export class Restock {
  @ApiProperty({ description: '补货ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '补货单号' })
  @Column({ name: 'restock_no', unique: true, length: 50 })
  restockNo: string;

  @ApiProperty({ description: '点位ID' })
  @Column({ name: 'point_id' })
  pointId: number;

  @ApiProperty({ description: '设备ID' })
  @Column({ name: 'device_id', nullable: true })
  deviceId: number;

  @ApiProperty({ description: '类型：umbrella-雨伞，charger-充电宝' })
  @Column({ length: 20 })
  type: string;

  @ApiProperty({ description: '补货数量' })
  @Column()
  quantity: number;

  @ApiProperty({ description: '补货前库存' })
  @Column({ name: 'before_stock' })
  beforeStock: number;

  @ApiProperty({ description: '补货后库存' })
  @Column({ name: 'after_stock' })
  afterStock: number;

  @ApiProperty({ description: '操作人' })
  @Column({ length: 50 })
  operator: string;

  @ApiProperty({ description: '补货图片', type: 'array', items: { type: 'string' } })
  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
