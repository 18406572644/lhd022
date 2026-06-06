import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Inventory } from '@/common/database/in-memory-db';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class InventoryService {
  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const inventoryNo = ExcelUtil.generateNo('PD');
    const inventoryData = {
      ...createInventoryDto,
      inventoryNo,
      reason: createInventoryDto.reason || '',
      handleMethod: createInventoryDto.handleMethod || '',
      status: createInventoryDto.status || 'pending',
      images: createInventoryDto.images || [],
    };
    return db.addInventory(inventoryData);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Inventory>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getInventory()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.inventoryNo.toLowerCase().includes(kw) ||
          item.lossType.toLowerCase().includes(kw) ||
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

  async findOne(id: number): Promise<Inventory> {
    const inventory = db.getInventory().find((i) => i.id === id);
    if (!inventory) {
      throw new NotFoundException('盘点单不存在');
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    const updated = db.updateInventory(id, updateInventoryDto);
    return updated;
  }

  async remove(id: number): Promise<void> {
    throw new NotFoundException('盘点单不支持删除');
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const inventoryData: CreateInventoryDto = {
          deviceId: Number(item['设备ID'] || item['deviceId']),
          pointId: Number(item['点位ID'] || item['pointId']),
          lossType: item['损耗类型'] || item['lossType'],
          reason: item['损耗原因'] || item['reason'],
          handler: item['处理人'] || item['handler'],
          handleMethod: item['处理方式'] || item['handleMethod'],
          status: item['状态'] || item['status'] || 'pending',
        };
        await this.create(inventoryData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const inventoryItems = [...db.getInventory()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const exportData = inventoryItems.map((inventory) => ({
      ID: inventory.id,
      盘点单号: inventory.inventoryNo,
      设备ID: inventory.deviceId,
      点位ID: inventory.pointId,
      损耗类型: inventory.lossType,
      损耗原因: inventory.reason,
      处理人: inventory.handler,
      处理方式: inventory.handleMethod,
      状态: inventory.status,
      创建时间: inventory.createdAt,
    }));
    return ExcelUtil.exportExcel(exportData, '盘点数据');
  }
}
