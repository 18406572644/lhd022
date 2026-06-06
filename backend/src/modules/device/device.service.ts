import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { db, Device } from '@/common/database/in-memory-db';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class DeviceService {
  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const existing = db
      .getDevices()
      .find((d) => d.deviceNo === createDeviceDto.deviceNo || d.snCode === createDeviceDto.snCode);

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
    return db.addDevice(deviceData);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Device>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getDevices()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.deviceNo.toLowerCase().includes(kw) ||
          item.snCode.toLowerCase().includes(kw) ||
          item.type.toLowerCase().includes(kw),
      );
    }

    if (regionId !== undefined) {
      const points = db.getPoints().filter((p) => p.regionId === Number(regionId)).map((p) => p.id);
      data = data.filter((item) => points.includes(item.pointId));
    }

    if (status) {
      data = data.filter((item) => item.status === status);
    }

    if (startTime) {
      const start = new Date(startTime);
      data = data.filter((item) => new Date(item.createdAt) >= start);
    }

    if (endTime) {
      const end = new Date(endTime);
      end.setHours(23, 59, 59, 999);
      data = data.filter((item) => new Date(item.createdAt) <= end);
    }

    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = data.length;
    const skip = (page - 1) * pageSize;
    const list = data.slice(skip, skip + pageSize);

    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<Device> {
    const device = db.getDevices().find((d) => d.id === id);
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
    const updated = db.updateDevice(id, updateData);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const success = db.deleteDevice(id);
    if (!success) {
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
    const devices = [...db.getDevices()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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
