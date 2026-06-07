import { Controller, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('统计分析')
@Controller('api/v1/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取看板数据' })
  getDashboard() {
    return this.statisticsService.getDashboard();
  }

  @Get('overview')
  @ApiOperation({ summary: '获取概览数据（兼容前端）' })
  getOverview() {
    return this.statisticsService.getDashboard();
  }

  @Get('trend')
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  getTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return this.statisticsService.getTrend(daysNum);
  }

  @Get('order-trend')
  @ApiOperation({ summary: '获取订单趋势（兼容前端）' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  getOrderTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return this.statisticsService.getTrend(daysNum);
  }

  @Get('device-status')
  @ApiOperation({ summary: '获取设备状态分布' })
  getDeviceStatus() {
    return this.statisticsService.getDeviceStatus();
  }

  @Get('region-data')
  @ApiOperation({ summary: '获取区域数据对比' })
  getRegionData() {
    return this.statisticsService.getRegionData();
  }

  @Get('heatmap')
  @ApiOperation({ summary: '获取热力图数据（点位订单密度）' })
  getHeatmap() {
    return this.statisticsService.getHeatmapData();
  }

  @Get('sankey')
  @ApiOperation({ summary: '获取桑基图数据（故障流转路径）' })
  getSankey() {
    return this.statisticsService.getSankeyData();
  }

  @Get('radar')
  @ApiOperation({ summary: '获取雷达图数据（区域运维KPI对比）' })
  getRadar() {
    return this.statisticsService.getRadarData();
  }

  @Get('funnel')
  @ApiOperation({ summary: '获取漏斗图数据（报修单处理转化率）' })
  getFunnel() {
    return this.statisticsService.getFunnelData();
  }

  @Get('drill-down')
  @ApiOperation({ summary: '数据钻取' })
  @ApiQuery({ name: 'dimension', required: true, description: '维度：orders/repairs/devices/points' })
  @ApiQuery({ name: 'regionId', required: false, description: '区域ID' })
  @ApiQuery({ name: 'pointId', required: false, description: '点位ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  getDrillDown(
    @Query('dimension') dimension: string,
    @Query('regionId') regionId?: string,
    @Query('pointId') pointId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getDrillDownData(dimension, {
      regionId: regionId ? parseInt(regionId) : undefined,
      pointId: pointId ? parseInt(pointId) : undefined,
      startDate,
      endDate,
    });
  }

  @Post('olap')
  @ApiOperation({ summary: 'OLAP多维数据分析（上卷/下钻/切片/切块）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cube: { type: 'string', description: '数据立方体：orders/repairs/devices' },
        dimensions: { type: 'array', items: { type: 'string' }, description: '维度数组' },
        measures: { type: 'array', items: { type: 'string' }, description: '度量数组' },
        filters: { type: 'object', description: '过滤条件' },
        drillDown: { type: 'string', description: '下钻维度' },
        rollUp: { type: 'string', description: '上卷维度' },
        slice: { type: 'object', properties: { dimension: { type: 'string' }, value: {} } },
        dice: { type: 'object', properties: { dimension: { type: 'string' }, values: { type: 'array' } } },
      },
    },
  })
  getOLAP(@Body() params: any) {
    return this.statisticsService.getOLAPData(params);
  }
}
