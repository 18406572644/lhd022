import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePointDto {
  @ApiProperty({ description: '点位名称' })
  @IsNotEmpty({ message: '点位名称不能为空' })
  @IsString({ message: '点位名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '详细地址' })
  @IsNotEmpty({ message: '详细地址不能为空' })
  @IsString({ message: '详细地址必须是字符串' })
  address: string;

  @ApiProperty({ description: '区域ID' })
  @IsNotEmpty({ message: '区域ID不能为空' })
  @IsNumber({}, { message: '区域ID必须是数字' })
  regionId: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber({}, { message: '经度必须是数字' })
  longitude?: number;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber({}, { message: '纬度必须是数字' })
  latitude?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsOptional()
  @IsString({ message: '负责人必须是字符串' })
  manager?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '联系电话格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '点位图片', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];

  @ApiPropertyOptional({ description: '状态：active-启用，inactive-禁用，maintenance-维护中' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;
}
