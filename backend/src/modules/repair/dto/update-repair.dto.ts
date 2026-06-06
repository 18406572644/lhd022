import { PartialType } from '@nestjs/swagger';
import { CreateRepairDto } from './create-repair.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateRepairDto extends PartialType(CreateRepairDto) {
  @ApiPropertyOptional({ description: '报修ID' })
  @IsOptional()
  @IsInt({ message: 'ID必须是整数' })
  id?: number;
}
