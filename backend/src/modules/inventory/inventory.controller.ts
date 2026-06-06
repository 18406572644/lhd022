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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('盘点管理')
@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: '创建盘点单' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取盘点单列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryService.findAll(paginationDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出盘点数据' })
  async export(@Response() res: any) {
    const buffer = await this.inventoryService.export();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=inventory-${Date.now()}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入盘点' })
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
    return this.inventoryService.import(file);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取盘点单详情' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新盘点单' })
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除盘点单' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
