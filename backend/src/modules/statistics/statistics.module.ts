import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';
import { Region } from '@/entities/region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device, Order, Repair, Point, Region,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
