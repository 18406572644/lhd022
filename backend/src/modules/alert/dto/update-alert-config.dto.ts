import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateAlertConfigDto {
  @ApiProperty({ description: '预警名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '指标类型', required: false })
  @IsOptional()
  @IsString()
  metricType?: string;

  @ApiProperty({ description: '比较运算符', required: false })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiProperty({ description: '阈值', required: false })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiProperty({ description: '预警级别', required: false })
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

  @ApiProperty({ description: '检测周期（分钟）', required: false })
  @IsOptional()
  @IsNumber()
  checkInterval?: number;

  @ApiProperty({ description: '静默时间（分钟）', required: false })
  @IsOptional()
  @IsNumber()
  silenceDuration?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
