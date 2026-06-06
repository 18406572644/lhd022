import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('point')
export class Point {
  @ApiProperty({ description: '点位ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '点位名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '详细地址' })
  @Column({ length: 255 })
  address: string;

  @ApiProperty({ description: '经度' })
  @Column({ type: 'float', nullable: true })
  longitude: number;

  @ApiProperty({ description: '纬度' })
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @ApiProperty({ description: '区域ID' })
  @Column()
  regionId: number;

  @ApiProperty({ description: '负责人' })
  @Column({ length: 50, nullable: true })
  manager: string;

  @ApiProperty({ description: '联系电话' })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: '点位图片', type: 'array', items: { type: 'string' } })
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '状态：active-启用，inactive-禁用，maintenance-维护中' })
  @Column({ length: 20, default: 'active' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
