import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRepairDto {
  @ApiProperty({ description: '设备ID' })
  @IsNotEmpty({ message: '设备ID不能为空' })
  @IsInt({ message: '设备ID必须是整数' })
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @IsNotEmpty({ message: '点位ID不能为空' })
  @IsInt({ message: '点位ID必须是整数' })
  pointId: number;

  @ApiProperty({ description: '故障类型' })
  @IsNotEmpty({ message: '故障类型不能为空' })
  @IsString({ message: '故障类型必须是字符串' })
  faultType: string;

  @ApiPropertyOptional({ description: '故障描述' })
  @IsOptional()
  @IsString({ message: '故障描述必须是字符串' })
  description?: string;

  @ApiPropertyOptional({ description: '故障图片', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];

  @ApiPropertyOptional({ description: '优先级：low-低，medium-中，high-高，urgent-紧急' })
  @IsOptional()
  @IsString({ message: '优先级必须是字符串' })
  priority?: string;

  @ApiPropertyOptional({ description: '状态：pending-待处理，processing-处理中，resolved-已解决，closed-已关闭' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @ApiPropertyOptional({ description: '上报人' })
  @IsOptional()
  @IsString({ message: '上报人必须是字符串' })
  reporter?: string;

  @ApiPropertyOptional({ description: '处理人' })
  @IsOptional()
  @IsString({ message: '处理人必须是字符串' })
  handler?: string;

  @ApiPropertyOptional({ description: '上报时间' })
  @IsOptional()
  @IsDateString({}, { message: '上报时间格式不正确' })
  reportTime?: string;

  @ApiPropertyOptional({ description: '解决时间' })
  @IsOptional()
  @IsDateString({}, { message: '解决时间格式不正确' })
  resolveTime?: string;
}
