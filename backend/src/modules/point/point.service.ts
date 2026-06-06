import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Point } from '@/common/database/in-memory-db';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class PointService {
  async create(createPointDto: CreatePointDto): Promise<Point> {
    return db.addPoint({
      ...createPointDto,
      longitude: createPointDto.longitude || 0,
      latitude: createPointDto.latitude || 0,
      manager: createPointDto.manager || '',
      phone: createPointDto.phone || '',
      status: createPointDto.status || 'active',
      images: createPointDto.images || [],
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Point>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getPoints()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(kw) ||
          item.address.toLowerCase().includes(kw) ||
          item.manager.toLowerCase().includes(kw) ||
          item.phone.toLowerCase().includes(kw),
      );
    }

    if (regionId !== undefined) {
      data = data.filter((item) => item.regionId === Number(regionId));
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

  async findOne(id: number): Promise<Point> {
    const point = db.getPoints().find((p) => p.id === id);
    if (!point) {
      throw new NotFoundException('点位不存在');
    }
    return point;
  }

  async update(id: number, updatePointDto: UpdatePointDto): Promise<Point> {
    const point = await this.findOne(id);
    const updated = db.updatePoint(id, updatePointDto);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const success = db.deletePoint(id);
    if (!success) {
      throw new NotFoundException('点位不存在');
    }
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const pointData: CreatePointDto = {
          name: item['点位名称'] || item['name'],
          address: item['详细地址'] || item['address'],
          regionId: Number(item['区域ID'] || item['regionId']),
          longitude: item['经度'] || item['longitude'] ? Number(item['经度'] || item['longitude']) : undefined,
          latitude: item['纬度'] || item['latitude'] ? Number(item['纬度'] || item['latitude']) : undefined,
          manager: item['负责人'] || item['manager'],
          phone: item['联系电话'] || item['phone'],
          status: item['状态'] || item['status'] || 'active',
        };
        await this.create(pointData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const points = [...db.getPoints()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const exportData = points.map((point) => ({
      ID: point.id,
      点位名称: point.name,
      详细地址: point.address,
      经度: point.longitude,
      纬度: point.latitude,
      区域ID: point.regionId,
      负责人: point.manager,
      联系电话: point.phone,
      状态: point.status,
      创建时间: point.createdAt,
      更新时间: point.updatedAt,
    }));
    return ExcelUtil.exportExcel(exportData, '点位数据');
  }
}
