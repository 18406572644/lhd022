import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @Get('trend')
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  getTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return this.statisticsService.getTrend(daysNum);
  }
}
