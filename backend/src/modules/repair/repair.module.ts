import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repair, Point])],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}
