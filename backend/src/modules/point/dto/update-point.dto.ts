import { PartialType } from '@nestjs/swagger';
import { CreatePointDto } from './create-point.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdatePointDto extends PartialType(CreatePointDto) {
  @ApiPropertyOptional({ description: '点位ID' })
  @IsOptional()
  @IsNumber({}, { message: 'ID必须是数字' })
  id?: number;
}
