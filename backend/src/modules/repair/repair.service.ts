import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Repair } from '@/common/database/in-memory-db';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class RepairService {
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
    return db.addRepair(repairData);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Repair>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getRepairs()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.repairNo.toLowerCase().includes(kw) ||
          item.faultType.toLowerCase().includes(kw) ||
          item.reporter.toLowerCase().includes(kw) ||
          item.handler.toLowerCase().includes(kw),
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

  async findOne(id: number): Promise<Repair> {
    const repair = db.getRepairs().find((r) => r.id === id);
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
    const updated = db.updateRepair(id, updateData);
    return updated;
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
    const repairs = [...db.getRepairs()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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
