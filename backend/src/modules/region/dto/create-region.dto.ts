import { IsNotEmpty, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ description: '区域名称' })
  @IsNotEmpty({ message: '区域名称不能为空' })
  @IsString({ message: '区域名称必须是字符串' })
  name: string;

  @ApiPropertyOptional({ description: '父级区域ID' })
  @IsOptional()
  @IsInt({ message: '父级区域ID必须是整数' })
  parentId?: number;

  @ApiPropertyOptional({ description: '层级：1-省，2-市，3-区' })
  @IsOptional()
  @IsInt({ message: '层级必须是整数' })
  @Min(1, { message: '层级不能小于1' })
  level?: number;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  sort?: number;
}
