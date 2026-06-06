import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsString({ message: '用户ID必须是字符串' })
  userId: string;

  @ApiProperty({ description: '设备ID' })
  @IsNotEmpty({ message: '设备ID不能为空' })
  @IsInt({ message: '设备ID必须是整数' })
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @IsNotEmpty({ message: '点位ID不能为空' })
  @IsInt({ message: '点位ID必须是整数' })
  pointId: number;

  @ApiProperty({ description: '类型：umbrella-雨伞，charger-充电宝' })
  @IsNotEmpty({ message: '类型不能为空' })
  @IsString({ message: '类型必须是字符串' })
  type: string;

  @ApiProperty({ description: '租借时间' })
  @IsNotEmpty({ message: '租借时间不能为空' })
  @IsDateString({}, { message: '租借时间格式不正确' })
  rentTime: string;

  @ApiPropertyOptional({ description: '归还时间' })
  @IsOptional()
  @IsDateString({}, { message: '归还时间格式不正确' })
  returnTime?: string;

  @ApiPropertyOptional({ description: '时长（分钟）' })
  @IsOptional()
  @IsInt({ message: '时长必须是整数' })
  @Min(0, { message: '时长不能小于0' })
  duration?: number;

  @ApiPropertyOptional({ description: '费用' })
  @IsOptional()
  @IsNumber({}, { message: '费用必须是数字' })
  @Min(0, { message: '费用不能小于0' })
  amount?: number;

  @ApiPropertyOptional({ description: '状态：renting-租借中，returned-已归还，overdue-逾期，lost-丢失' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;
}
