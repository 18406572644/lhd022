import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateDashboardDto {
  @ApiProperty({ description: '仪表盘名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '仪表盘描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否为公共仪表盘', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '布局配置JSON', required: false })
  @IsOptional()
  layout?: any;

  @ApiProperty({ description: '图表组件配置JSON', required: false })
  @IsOptional()
  widgets?: any;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
