import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@ApiTags('仪表盘')
@Controller('api/v1/dashboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: '创建仪表盘' })
  create(@CurrentUser() user: any, @Body() createDto: CreateDashboardDto) {
    return this.dashboardService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取仪表盘列表' })
  findAll(@CurrentUser() user: any) {
    return this.dashboardService.findAll(user.id);
  }

  @Get('widgets')
  @ApiOperation({ summary: '获取可用图表组件列表' })
  getDefaultWidgets() {
    return this.dashboardService.getDefaultWidgets();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仪表盘详情' })
  @ApiParam({ name: 'id', description: '仪表盘ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dashboardService.findOne(parseInt(id), user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仪表盘' })
  @ApiParam({ name: 'id', description: '仪表盘ID' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(parseInt(id), user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仪表盘' })
  @ApiParam({ name: 'id', description: '仪表盘ID' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dashboardService.remove(parseInt(id), user.id);
  }
}
