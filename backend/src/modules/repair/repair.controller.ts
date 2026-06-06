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
import { RepairService } from './repair.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('报修管理')
@Controller('api/v1/repairs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  @ApiOperation({ summary: '创建报修单' })
  create(@Body() createRepairDto: CreateRepairDto) {
    return this.repairService.create(createRepairDto);
  }

  @Get()
  @ApiOperation({ summary: '获取报修单列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.repairService.findAll(paginationDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出报修数据' })
  async export(@Response() res: any) {
    const buffer = await this.repairService.export();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=repairs-${Date.now()}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入报修' })
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
    return this.repairService.import(file);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报修单详情' })
  findOne(@Param('id') id: string) {
    return this.repairService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新报修单' })
  update(@Param('id') id: string, @Body() updateRepairDto: UpdateRepairDto) {
    return this.repairService.update(+id, updateRepairDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除报修单' })
  remove(@Param('id') id: string) {
    return this.repairService.remove(+id);
  }
}
