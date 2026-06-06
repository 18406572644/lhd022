import { PartialType } from '@nestjs/swagger';
import { CreateRegionDto } from './create-region.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {
  @ApiPropertyOptional({ description: '区域ID' })
  @IsOptional()
  @IsInt({ message: 'ID必须是整数' })
  id?: number;
}
