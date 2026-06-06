import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: '密码' })
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: '姓名' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '角色：admin-管理员，supervisor-主管，operator-运维人员' })
  @Column({ length: 20, default: 'operator' })
  role: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: '是否启用' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
