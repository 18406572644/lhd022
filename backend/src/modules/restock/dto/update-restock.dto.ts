import { PartialType } from '@nestjs/swagger';
import { CreateRestockDto } from './create-restock.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateRestockDto extends PartialType(CreateRestockDto) {
  @ApiPropertyOptional({ description: '补货ID' })
  @IsOptional()
  @IsInt({ message: 'ID必须是整数' })
  id?: number;
}
