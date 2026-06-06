import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Restock } from '@/common/database/in-memory-db';
import { CreateRestockDto } from './dto/create-restock.dto';
import { UpdateRestockDto } from './dto/update-restock.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class RestockService {
  async create(createRestockDto: CreateRestockDto): Promise<Restock> {
    const restockNo = ExcelUtil.generateNo('BH');
    const restockData = {
      ...createRestockDto,
      restockNo,
      deviceId: createRestockDto.deviceId || 0,
      remark: createRestockDto.remark || '',
      images: createRestockDto.images || [],
    };
    return db.addRestock(restockData);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Restock>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getRestocks()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
        item.restockNo.toLowerCase().includes(kw) ||
          item.type.toLowerCase().includes(kw) ||
          item.operator.toLowerCase().includes(kw),
      );
    }

    if (regionId !== undefined) {
      const points = db.getPoints().filter((p) => p.regionId === Number(regionId)).map((p) => p.id);
      data = data.filter((item) => points.includes(item.pointId));
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

  async findOne(id: number): Promise<Restock> {
    const restock = db.getRestocks().find((r) => r.id === id);
    if (!restock) {
      throw new NotFoundException('补货单不存在');
    }
    return restock;
  }

  async update(id: number, updateRestockDto: UpdateRestockDto): Promise<Restock> {
    const restock = await this.findOne(id);
    Object.assign(restock, updateRestockDto);
    return restock;
  }

  async remove(id: number): Promise<void> {
    throw new NotFoundException('补货单不支持删除');
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const restockData: CreateRestockDto = {
          pointId: Number(item['点位ID'] || item['pointId']),
          deviceId: item['设备ID'] || item['deviceId'] ? Number(item['设备ID'] || item['deviceId']) : undefined,
          type: item['类型'] || item['type'],
          quantity: Number(item['补货数量'] || item['quantity']),
          beforeStock: Number(item['补货前库存'] || item['beforeStock']),
          afterStock: Number(item['补货后库存'] || item['afterStock']),
          operator: item['操作人'] || item['operator'],
          remark: item['备注'] || item['remark'],
        };
        await this.create(restockData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const restocks = [...db.getRestocks()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const exportData = restocks.map((restock) => ({
      ID: restock.id,
      补货单号: restock.restockNo,
      点位ID: restock.pointId,
      设备ID: restock.deviceId,
      类型: restock.type,
      补货数量: restock.quantity,
      补货前库存: restock.beforeStock,
      补货后库存: restock.afterStock,
      操作人: restock.operator,
      备注: restock.remark,
      创建时间: restock.createdAt,
    }));
    return ExcelUtil.exportExcel(exportData, '补货数据');
  }
}
