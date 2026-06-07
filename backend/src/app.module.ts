import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RegionModule } from './modules/region/region.module';
import { PointModule } from './modules/point/point.module';
import { DeviceModule } from './modules/device/device.module';
import { RepairModule } from './modules/repair/repair.module';
import { RestockModule } from './modules/restock/restock.module';
import { OrderModule } from './modules/order/order.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UploadModule } from './modules/upload/upload.module';
import { SeedModule } from './common/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', '123456'),
        database: configService.get('DB_NAME', 'sharing_station'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
        timezone: '+08:00',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    RegionModule,
    PointModule,
    DeviceModule,
    RepairModule,
    RestockModule,
    OrderModule,
    InventoryModule,
    StatisticsModule,
    UploadModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
