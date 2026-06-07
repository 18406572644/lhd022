import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from '@/entities/point.entity';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

  async create(createPointDto: CreatePointDto): Promise<Point> {
    const pointData = {
      ...createPointDto,
      longitude: createPointDto.longitude || 0,
      latitude: createPointDto.latitude || 0,
      manager: createPointDto.manager || '',
      phone: createPointDto.phone || '',
      status: createPointDto.status || 'active',
      images: createPointDto.images || [],
    };
    const point = this.pointRepository.create(pointData);
    return this.pointRepository.save(point);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Point>> {
    return QueryUtil.findWithPagination<Point>(
      this.pointRepository,
      paginationDto,
      ['name', 'address', 'manager', 'phone'],
    );
  }

  async findOne(id: number): Promise<Point> {
    const point = await this.pointRepository.findOne({ where: { id } });
    if (!point) {
      throw new NotFoundException('点位不存在');
    }
    return point;
  }

  async update(id: number, updatePointDto: UpdatePointDto): Promise<Point> {
    const point = await this.findOne(id);
    await this.pointRepository.update(id, updatePointDto);
    return this.pointRepository.findOne({ where: { id } }) as Promise<Point>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.pointRepository.delete(id);
    if (result.affected === 0) {
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
    const points = await this.pointRepository.find({
      order: { createdAt: 'DESC' },
    });
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
