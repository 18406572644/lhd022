import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '@/entities/user.entity';
import { Region } from '@/entities/region.entity';
import { Point } from '@/entities/point.entity';
import { Device } from '@/entities/device.entity';
import { Order } from '@/entities/order.entity';
import { Repair } from '@/entities/repair.entity';
import { Restock } from '@/entities/restock.entity';
import { Inventory } from '@/entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Region, Point, Device, Order, Repair, Restock, Inventory,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
