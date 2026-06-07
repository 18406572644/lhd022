import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertConfig } from '@/entities/alert-config.entity';
import { AlertRecord } from '@/entities/alert-record.entity';
import { Device } from '@/entities/device.entity';
import { Repair } from '@/entities/repair.entity';
import { User } from '@/entities/user.entity';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlertConfig, AlertRecord, Device, Repair, User])],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
