import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '@/entities/order.entity';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Point])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
