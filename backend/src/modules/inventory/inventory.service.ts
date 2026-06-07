import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '@/entities/inventory.entity';
import { Point } from '@/entities/point.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

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
    const inventory = this.inventoryRepository.create(inventoryData);
    return this.inventoryRepository.save(inventory);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Inventory>> {
    const { regionId } = paginationDto;

    if (regionId !== undefined) {
      const points = await this.pointRepository.find({
        where: { regionId: Number(regionId) },
        select: ['id'],
      });
      const pointIds = points.map((p) => p.id);

      const modifiedPaginationDto = { ...paginationDto, regionId: undefined };
      const result = await QueryUtil.findWithPagination<Inventory>(
        this.inventoryRepository,
        modifiedPaginationDto,
        ['inventoryNo', 'lossType', 'handler'],
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

    return QueryUtil.findWithPagination<Inventory>(
      this.inventoryRepository,
      paginationDto,
      ['inventoryNo', 'lossType', 'handler'],
    );
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('盘点单不存在');
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.update(id, updateInventoryDto);
    return this.inventoryRepository.findOne({ where: { id } }) as Promise<Inventory>;
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
    const inventoryItems = await this.inventoryRepository.find({
      order: { createdAt: 'DESC' },
    });
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
