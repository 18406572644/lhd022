import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('restock')
export class Restock {
  @ApiProperty({ description: '补货ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '补货单号' })
  @Column({ unique: true, length: 50 })
  restockNo: string;

  @ApiProperty({ description: '点位ID' })
  @Column()
  pointId: number;

  @ApiProperty({ description: '设备ID' })
  @Column({ nullable: true })
  deviceId: number;

  @ApiProperty({ description: '类型：umbrella-雨伞，charger-充电宝' })
  @Column({ length: 20 })
  type: string;

  @ApiProperty({ description: '补货数量' })
  @Column()
  quantity: number;

  @ApiProperty({ description: '补货前库存' })
  @Column()
  beforeStock: number;

  @ApiProperty({ description: '补货后库存' })
  @Column()
  afterStock: number;

  @ApiProperty({ description: '操作人' })
  @Column({ length: 50 })
  operator: string;

  @ApiProperty({ description: '补货图片', type: 'array', items: { type: 'string' } })
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
