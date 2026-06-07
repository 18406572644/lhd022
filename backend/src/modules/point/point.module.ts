import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Point])],
  controllers: [PointController],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule {}
