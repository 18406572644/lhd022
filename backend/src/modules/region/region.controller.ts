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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('区域管理')
@Controller('api/v1/regions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @ApiOperation({ summary: '创建区域' })
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取区域列表（支持筛选）' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.regionService.findAll(paginationDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取区域树状结构' })
  findTree() {
    return this.regionService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取区域详情' })
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新区域' })
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionService.update(+id, updateRegionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除区域' })
  remove(@Param('id') id: string) {
    return this.regionService.remove(+id);
  }
}
