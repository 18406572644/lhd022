import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ description: '设备编号' })
  @IsNotEmpty({ message: '设备编号不能为空' })
  @IsString({ message: '设备编号必须是字符串' })
  deviceNo: string;

  @ApiProperty({ description: 'SN码' })
  @IsNotEmpty({ message: 'SN码不能为空' })
  @IsString({ message: 'SN码必须是字符串' })
  snCode: string;

  @ApiProperty({ description: '设备类型：umbrella-雨伞，charger-充电宝' })
  @IsNotEmpty({ message: '设备类型不能为空' })
  @IsString({ message: '设备类型必须是字符串' })
  type: string;

  @ApiProperty({ description: '点位ID' })
  @IsNotEmpty({ message: '点位ID不能为空' })
  @IsInt({ message: '点位ID必须是整数' })
  pointId: number;

  @ApiPropertyOptional({ description: '容量' })
  @IsOptional()
  @IsInt({ message: '容量必须是整数' })
  @Min(0, { message: '容量不能小于0' })
  capacity?: number;

  @ApiPropertyOptional({ description: '当前库存' })
  @IsOptional()
  @IsInt({ message: '当前库存必须是整数' })
  @Min(0, { message: '当前库存不能小于0' })
  currentStock?: number;

  @ApiPropertyOptional({ description: '状态：online-在线，offline-离线，fault-故障，maintenance-维护中' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @ApiPropertyOptional({ description: '投放时间' })
  @IsOptional()
  @IsDateString({}, { message: '投放时间格式不正确' })
  launchTime?: string;

  @ApiPropertyOptional({ description: '租借次数' })
  @IsOptional()
  @IsInt({ message: '租借次数必须是整数' })
  @Min(0, { message: '租借次数不能小于0' })
  rentCount?: number;

  @ApiPropertyOptional({ description: '设备图片', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];
}
