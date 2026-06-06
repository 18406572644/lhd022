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
import { PointService } from './point.service';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('点位管理')
@Controller('api/v1/points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Post()
  @ApiOperation({ summary: '创建点位' })
  create(@Body() createPointDto: CreatePointDto) {
    return this.pointService.create(createPointDto);
  }

  @Get()
  @ApiOperation({ summary: '获取点位列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pointService.findAll(paginationDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出点位数据' })
  async export(@Response() res: any) {
    const buffer = await this.pointService.export();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=points-${Date.now()}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入点位' })
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
    return this.pointService.import(file);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取点位详情' })
  findOne(@Param('id') id: string) {
    return this.pointService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新点位' })
  update(@Param('id') id: string, @Body() updatePointDto: UpdatePointDto) {
    return this.pointService.update(+id, updatePointDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除点位' })
  remove(@Param('id') id: string) {
    return this.pointService.remove(+id);
  }
}
