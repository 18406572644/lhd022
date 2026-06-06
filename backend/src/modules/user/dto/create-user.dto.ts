import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString({ message: '姓名必须是字符串' })
  name: string;

  @ApiProperty({ description: '角色：admin-管理员，supervisor-主管，operator-运维人员', enum: ['admin', 'supervisor', 'operator'] })
  @IsNotEmpty({ message: '角色不能为空' })
  @IsEnum(['admin', 'supervisor', 'operator'], { message: '角色值不正确' })
  role: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  isActive?: boolean;
}
