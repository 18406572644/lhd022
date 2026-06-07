import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventory } from '@/entities/inventory.entity';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Point])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
