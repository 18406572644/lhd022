import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestockDto {
  @ApiProperty({ description: '点位ID' })
  @IsNotEmpty({ message: '点位ID不能为空' })
  @IsInt({ message: '点位ID必须是整数' })
  pointId: number;

  @ApiPropertyOptional({ description: '设备ID' })
  @IsOptional()
  @IsInt({ message: '设备ID必须是整数' })
  deviceId?: number;

  @ApiProperty({ description: '类型：umbrella-雨伞，charger-充电宝' })
  @IsNotEmpty({ message: '类型不能为空' })
  @IsString({ message: '类型必须是字符串' })
  type: string;

  @ApiProperty({ description: '补货数量' })
  @IsNotEmpty({ message: '补货数量不能为空' })
  @IsInt({ message: '补货数量必须是整数' })
  @Min(1, { message: '补货数量不能小于1' })
  quantity: number;

  @ApiProperty({ description: '补货前库存' })
  @IsNotEmpty({ message: '补货前库存不能为空' })
  @IsInt({ message: '补货前库存必须是整数' })
  @Min(0, { message: '补货前库存不能小于0' })
  beforeStock: number;

  @ApiProperty({ description: '补货后库存' })
  @IsNotEmpty({ message: '补货后库存不能为空' })
  @IsInt({ message: '补货后库存必须是整数' })
  @Min(0, { message: '补货后库存不能小于0' })
  afterStock: number;

  @ApiProperty({ description: '操作人' })
  @IsNotEmpty({ message: '操作人不能为空' })
  @IsString({ message: '操作人必须是字符串' })
  operator: string;

  @ApiPropertyOptional({ description: '补货图片', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
