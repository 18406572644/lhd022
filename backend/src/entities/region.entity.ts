import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('region')
export class Region {
  @ApiProperty({ description: '区域ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '区域名称' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '父级区域ID' })
  @Column({ default: 0 })
  parentId: number;

  @ApiProperty({ description: '层级：1-省，2-市，3-区' })
  @Column({ type: 'tinyint', default: 1 })
  level: number;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
