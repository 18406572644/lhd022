import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class HandleAlertRecordDto {
  @ApiProperty({ description: '处理状态' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ description: '处理备注', required: false })
  @IsOptional()
  @IsString()
  handleRemark?: string;
}
