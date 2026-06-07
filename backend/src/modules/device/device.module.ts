import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device } from '@/entities/device.entity';
import { Point } from '@/entities/point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Point])],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
