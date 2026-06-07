import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateAlertConfigDto } from './dto/create-alert-config.dto';
import { UpdateAlertConfigDto } from './dto/update-alert-config.dto';
import { HandleAlertRecordDto } from './dto/handle-alert-record.dto';

@ApiTags('数据预警')
@Controller('api/v1/alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get('metrics')
  @ApiOperation({ summary: '获取可用预警指标' })
  getAvailableMetrics() {
    return this.alertService.getAvailableMetrics();
  }

  @Get('summary')
  @ApiOperation({ summary: '获取预警统计概览' })
  getAlertSummary() {
    return this.alertService.getAlertSummary();
  }

  @Post('check')
  @ApiOperation({ summary: '手动执行预警检测' })
  checkAlerts() {
    return this.alertService.checkAlerts();
  }

  @Post('configs')
  @ApiOperation({ summary: '创建预警配置' })
  createConfig(@CurrentUser() user: any, @Body() createDto: CreateAlertConfigDto) {
    return this.alertService.createConfig(user.id, createDto);
  }

  @Get('configs')
  @ApiOperation({ summary: '获取预警配置列表' })
  findAllConfigs() {
    return this.alertService.findAllConfigs();
  }

  @Get('configs/:id')
  @ApiOperation({ summary: '获取预警配置详情' })
  @ApiParam({ name: 'id', description: '配置ID' })
  findOneConfig(@Param('id') id: string) {
    return this.alertService.findOneConfig(parseInt(id));
  }

  @Put('configs/:id')
  @ApiOperation({ summary: '更新预警配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  updateConfig(@Param('id') id: string, @Body() updateDto: UpdateAlertConfigDto) {
    return this.alertService.updateConfig(parseInt(id), updateDto);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: '删除预警配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  removeConfig(@Param('id') id: string) {
    return this.alertService.removeConfig(parseInt(id));
  }

  @Get('records')
  @ApiOperation({ summary: '获取预警记录列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态：pending/processing/resolved/ignored' })
  @ApiQuery({ name: 'level', required: false, description: '级别：low/medium/high/urgent' })
  @ApiQuery({ name: 'metricType', required: false, description: '指标类型' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数' })
  findAllRecords(
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('metricType') metricType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.alertService.findAllRecords({
      status,
      level,
      metricType,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('records/:id')
  @ApiOperation({ summary: '获取预警记录详情' })
  @ApiParam({ name: 'id', description: '记录ID' })
  findOneRecord(@Param('id') id: string) {
    return this.alertService.findOneRecord(parseInt(id));
  }

  @Put('records/:id/handle')
  @ApiOperation({ summary: '处理预警记录' })
  @ApiParam({ name: 'id', description: '记录ID' })
  handleRecord(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() handleDto: HandleAlertRecordDto,
  ) {
    return this.alertService.handleRecord(parseInt(id), user.id, handleDto);
  }
}
