import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Device } from '@/entities/device.entity';
import { Point } from '@/entities/point.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const existing = await this.deviceRepository.findOne({
      where: [
        { deviceNo: createDeviceDto.deviceNo },
        { snCode: createDeviceDto.snCode },
      ],
    });

    if (existing) {
      throw new ConflictException('设备编号或SN码已存在');
    }

    const deviceData = {
      ...createDeviceDto,
      capacity: createDeviceDto.capacity || 0,
      currentStock: createDeviceDto.currentStock || 0,
      status: createDeviceDto.status || 'online',
      launchTime: createDeviceDto.launchTime ? new Date(createDeviceDto.launchTime) : new Date(),
      rentCount: createDeviceDto.rentCount || 0,
      images: createDeviceDto.images || [],
    };
    const device = this.deviceRepository.create(deviceData);
    return this.deviceRepository.save(device);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Device>> {
    const { regionId } = paginationDto;

    if (regionId !== undefined) {
      const points = await this.pointRepository.find({
        where: { regionId: Number(regionId) },
        select: ['id'],
      });
      const pointIds = points.map((p) => p.id);

      const modifiedPaginationDto = { ...paginationDto, regionId: undefined };
      const result = await QueryUtil.findWithPagination<Device>(
        this.deviceRepository,
        modifiedPaginationDto,
        ['deviceNo', 'snCode', 'type'],
      );

      const filteredList = result.list.filter((item) => pointIds.includes(item.pointId));
      const filteredTotal = filteredList.length;

      return {
        list: filteredList,
        total: filteredTotal,
        page: paginationDto.page,
        pageSize: paginationDto.pageSize,
      };
    }

    return QueryUtil.findWithPagination<Device>(
      this.deviceRepository,
      paginationDto,
      ['deviceNo', 'snCode', 'type'],
    );
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException('设备不存在');
    }
    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    const updateData: any = { ...updateDeviceDto };
    if (updateDeviceDto.launchTime) {
      updateData.launchTime = new Date(updateDeviceDto.launchTime);
    }
    await this.deviceRepository.update(id, updateData);
    return this.deviceRepository.findOne({ where: { id } }) as Promise<Device>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.deviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('设备不存在');
    }
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const deviceData: CreateDeviceDto = {
          deviceNo: item['设备编号'] || item['deviceNo'],
          snCode: item['SN码'] || item['snCode'],
          type: item['设备类型'] || item['type'],
          pointId: Number(item['点位ID'] || item['pointId']),
          capacity: item['容量'] || item['capacity'] ? Number(item['容量'] || item['capacity']) : 0,
          currentStock: item['当前库存'] || item['currentStock'] ? Number(item['当前库存'] || item['currentStock']) : 0,
          status: item['状态'] || item['status'] || 'online',
          launchTime: item['投放时间'] || item['launchTime'],
          rentCount: item['租借次数'] || item['rentCount'] ? Number(item['租借次数'] || item['rentCount']) : 0,
        };
        await this.create(deviceData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const devices = await this.deviceRepository.find({
      order: { createdAt: 'DESC' },
    });
    const exportData = devices.map((device) => ({
      ID: device.id,
      设备编号: device.deviceNo,
      SN码: device.snCode,
      设备类型: device.type,
      点位ID: device.pointId,
      容量: device.capacity,
      当前库存: device.currentStock,
      状态: device.status,
      投放时间: device.launchTime,
      租借次数: device.rentCount,
      创建时间: device.createdAt,
      更新时间: device.updatedAt,
    }));
    return ExcelUtil.exportExcel(exportData, '设备数据');
  }
}
