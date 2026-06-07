import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair } from '@/entities/repair.entity';
import { Point } from '@/entities/point.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair) private repairRepository: Repository<Repair>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

  async create(createRepairDto: CreateRepairDto): Promise<Repair> {
    const repairNo = ExcelUtil.generateNo('BX');
    const repairData = {
      ...createRepairDto,
      repairNo,
      description: createRepairDto.description || '',
      priority: createRepairDto.priority || 'medium',
      status: createRepairDto.status || 'pending',
      reporter: createRepairDto.reporter || '',
      handler: createRepairDto.handler || '',
      reportTime: createRepairDto.reportTime ? new Date(createRepairDto.reportTime) : new Date(),
      resolveTime: createRepairDto.resolveTime ? new Date(createRepairDto.resolveTime) : null,
      images: createRepairDto.images || [],
    };
    const repair = this.repairRepository.create(repairData);
    return this.repairRepository.save(repair);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Repair>> {
    const { regionId } = paginationDto;

    if (regionId !== undefined) {
      const points = await this.pointRepository.find({
        where: { regionId: Number(regionId) },
        select: ['id'],
      });
      const pointIds = points.map((p) => p.id);

      const modifiedPaginationDto = { ...paginationDto, regionId: undefined };
      const result = await QueryUtil.findWithPagination<Repair>(
        this.repairRepository,
        modifiedPaginationDto,
        ['repairNo', 'faultType', 'reporter', 'handler'],
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

    return QueryUtil.findWithPagination<Repair>(
      this.repairRepository,
      paginationDto,
      ['repairNo', 'faultType', 'reporter', 'handler'],
    );
  }

  async findOne(id: number): Promise<Repair> {
    const repair = await this.repairRepository.findOne({ where: { id } });
    if (!repair) {
      throw new NotFoundException('报修单不存在');
    }
    return repair;
  }

  async update(id: number, updateRepairDto: UpdateRepairDto): Promise<Repair> {
    const repair = await this.findOne(id);
    const updateData: any = { ...updateRepairDto };
    if (updateRepairDto.reportTime) {
      updateData.reportTime = new Date(updateRepairDto.reportTime);
    }
    if (updateRepairDto.resolveTime !== undefined) {
      updateData.resolveTime = updateRepairDto.resolveTime ? new Date(updateRepairDto.resolveTime) : null;
    }
    await this.repairRepository.update(id, updateData);
    return this.repairRepository.findOne({ where: { id } }) as Promise<Repair>;
  }

  async remove(id: number): Promise<void> {
    throw new NotFoundException('报修单不支持删除');
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const repairData: CreateRepairDto = {
          deviceId: Number(item['设备ID'] || item['deviceId']),
          pointId: Number(item['点位ID'] || item['pointId']),
          faultType: item['故障类型'] || item['faultType'],
          description: item['故障描述'] || item['description'],
          priority: item['优先级'] || item['priority'] || 'medium',
          status: item['状态'] || item['status'] || 'pending',
          reporter: item['上报人'] || item['reporter'],
          handler: item['处理人'] || item['handler'],
          reportTime: item['上报时间'] || item['reportTime'],
          resolveTime: item['解决时间'] || item['resolveTime'],
        };
        await this.create(repairData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const repairs = await this.repairRepository.find({
      order: { createdAt: 'DESC' },
    });
    const exportData = repairs.map((repair) => ({
      ID: repair.id,
      报修单号: repair.repairNo,
      设备ID: repair.deviceId,
      点位ID: repair.pointId,
      故障类型: repair.faultType,
      故障描述: repair.description,
      优先级: repair.priority,
      状态: repair.status,
      上报人: repair.reporter,
      处理人: repair.handler,
      上报时间: repair.reportTime,
      解决时间: repair.resolveTime,
      创建时间: repair.createdAt,
      更新时间: repair.updatedAt,
    }));
    return ExcelUtil.exportExcel(exportData, '报修数据');
  }
}
