import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateAlertConfigDto {
  @ApiProperty({ description: '预警名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '指标类型' })
  @IsNotEmpty()
  @IsString()
  metricType: string;

  @ApiProperty({ description: '比较运算符' })
  @IsNotEmpty()
  @IsString()
  operator: string;

  @ApiProperty({ description: '阈值' })
  @IsNotEmpty()
  @IsNumber()
  threshold: number;

  @ApiProperty({ description: '预警级别', required: false, default: 'medium' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ description: '通知方式', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  notifyChannels?: string[];

  @ApiProperty({ description: '通知接收人', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  receivers?: string[];

  @ApiProperty({ description: '检测周期（分钟）', required: false, default: 60 })
  @IsOptional()
  @IsNumber()
  checkInterval?: number;

  @ApiProperty({ description: '静默时间（分钟）', required: false, default: 120 })
  @IsOptional()
  @IsNumber()
  silenceDuration?: number;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
