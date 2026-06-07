import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('dashboard')
export class Dashboard {
  @ApiProperty({ description: '仪表盘ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '仪表盘名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '仪表盘描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '所属用户ID' })
  @Column({ name: 'user_id', length: 50, nullable: true })
  userId: string;

  @ApiProperty({ description: '是否为公共仪表盘' })
  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @ApiProperty({ description: '布局配置JSON' })
  @Column({ type: 'json', nullable: true })
  layout: any;

  @ApiProperty({ description: '图表组件配置JSON' })
  @Column({ type: 'json', nullable: true })
  widgets: any;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '状态：active-启用，inactive-禁用' })
  @Column({ length: 20, default: 'active' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
