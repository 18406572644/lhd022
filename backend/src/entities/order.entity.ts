import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order')
export class Order {
  @ApiProperty({ description: '订单ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '订单号' })
  @Column({ unique: true, length: 50 })
  orderNo: string;

  @ApiProperty({ description: '用户ID' })
  @Column({ length: 50 })
  userId: string;

  @ApiProperty({ description: '设备ID' })
  @Column()
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @Column()
  pointId: number;

  @ApiProperty({ description: '类型：umbrella-雨伞，charger-充电宝' })
  @Column({ length: 20 })
  type: string;

  @ApiProperty({ description: '租借时间' })
  @Column({ type: 'datetime' })
  rentTime: Date;

  @ApiProperty({ description: '归还时间' })
  @Column({ type: 'datetime', nullable: true })
  returnTime: Date;

  @ApiProperty({ description: '时长（分钟）' })
  @Column({ default: 0 })
  duration: number;

  @ApiProperty({ description: '费用' })
  @Column({ type: 'float', default: 0 })
  amount: number;

  @ApiProperty({ description: '状态：renting-租借中，returned-已归还，overdue-逾期，lost-丢失' })
  @Column({ length: 20, default: 'renting' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
