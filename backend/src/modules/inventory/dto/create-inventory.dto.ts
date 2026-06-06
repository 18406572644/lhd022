import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ description: '设备ID' })
  @IsNotEmpty({ message: '设备ID不能为空' })
  @IsInt({ message: '设备ID必须是整数' })
  deviceId: number;

  @ApiProperty({ description: '点位ID' })
  @IsNotEmpty({ message: '点位ID不能为空' })
  @IsInt({ message: '点位ID必须是整数' })
  pointId: number;

  @ApiProperty({ description: '损耗类型：damage-损坏，lost-丢失，expired-过期，other-其他' })
  @IsNotEmpty({ message: '损耗类型不能为空' })
  @IsString({ message: '损耗类型必须是字符串' })
  lossType: string;

  @ApiPropertyOptional({ description: '损耗原因' })
  @IsOptional()
  @IsString({ message: '损耗原因必须是字符串' })
  reason?: string;

  @ApiProperty({ description: '处理人' })
  @IsNotEmpty({ message: '处理人不能为空' })
  @IsString({ message: '处理人必须是字符串' })
  handler: string;

  @ApiPropertyOptional({ description: '损耗图片', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];

  @ApiPropertyOptional({ description: '处理方式：repair-维修，replace-更换，scrap-报废' })
  @IsOptional()
  @IsString({ message: '处理方式必须是字符串' })
  handleMethod?: string;

  @ApiPropertyOptional({ description: '状态：pending-待处理，completed-已完成' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;
}
