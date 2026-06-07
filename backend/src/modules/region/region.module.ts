import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { Region } from '@/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region])],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
