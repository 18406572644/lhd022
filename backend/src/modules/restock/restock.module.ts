import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestockController } from './restock.controller';
import { RestockService } from './restock.service';
import { Restock } from '@/entities/restock.entity';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restock, Point])],
  controllers: [RestockController],
  providers: [RestockService],
  exports: [RestockService],
})
export class RestockModule {}
