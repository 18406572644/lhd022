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
import { RestockService } from './restock.service';
import { CreateRestockDto } from './dto/create-restock.dto';
import { UpdateRestockDto } from './dto/update-restock.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('补货管理')
@Controller('api/v1/restocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestockController {
  constructor(private readonly restockService: RestockService) {}

  @Post()
  @ApiOperation({ summary: '创建补货单' })
  create(@Body() createRestockDto: CreateRestockDto) {
    return this.restockService.create(createRestockDto);
  }

  @Get()
  @ApiOperation({ summary: '获取补货单列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.restockService.findAll(paginationDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出补货数据' })
  async export(@Response() res: any) {
    const buffer = await this.restockService.export();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=restocks-${Date.now()}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入补货' })
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
    return this.restockService.import(file);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取补货单详情' })
  findOne(@Param('id') id: string) {
    return this.restockService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新补货单' })
  update(@Param('id') id: string, @Body() updateRestockDto: UpdateRestockDto) {
    return this.restockService.update(+id, updateRestockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除补货单' })
  remove(@Param('id') id: string) {
    return this.restockService.remove(+id);
  }
}
