import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('设备管理')
@Controller('api/v1/devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @ApiOperation({ summary: '创建设备' })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: '获取设备列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.deviceService.findAll(paginationDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出设备数据' })
  async export(@Response() res: any) {
    const buffer = await this.deviceService.export();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=devices-${Date.now()}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入设备' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  import(@UploadedFile() file: Express.Multer.File) {
    return this.deviceService.import(file);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取设备详情' })
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新设备' })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除设备' })
  remove(@Param('id') id: string) {
    return this.deviceService.remove(+id);
  }
}
