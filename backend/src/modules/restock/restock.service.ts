import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restock } from '@/entities/restock.entity';
import { Point } from '@/entities/point.entity';
import { CreateRestockDto } from './dto/create-restock.dto';
import { UpdateRestockDto } from './dto/update-restock.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class RestockService {
  constructor(
    @InjectRepository(Restock) private restockRepository: Repository<Restock>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

  async create(createRestockDto: CreateRestockDto): Promise<Restock> {
    const restockNo = ExcelUtil.generateNo('BH');
    const restockData = {
      ...createRestockDto,
      restockNo,
      deviceId: createRestockDto.deviceId || 0,
      remark: createRestockDto.remark || '',
      images: createRestockDto.images || [],
    };
    const restock = this.restockRepository.create(restockData);
    return this.restockRepository.save(restock);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Restock>> {
    const { regionId, status, ...rest } = paginationDto;
    const modifiedPaginationDto = { ...rest, regionId: undefined, status: undefined };

    if (regionId !== undefined) {
      const points = await this.pointRepository.find({
        where: { regionId: Number(regionId) },
        select: ['id'],
      });
      const pointIds = points.map((p) => p.id);

      const result = await QueryUtil.findWithPagination<Restock>(
        this.restockRepository,
        modifiedPaginationDto,
        ['restockNo', 'type', 'operator'],
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

    return QueryUtil.findWithPagination<Restock>(
      this.restockRepository,
      modifiedPaginationDto,
      ['restockNo', 'type', 'operator'],
    );
  }

  async findOne(id: number): Promise<Restock> {
    const restock = await this.restockRepository.findOne({ where: { id } });
    if (!restock) {
      throw new NotFoundException('补货单不存在');
    }
    return restock;
  }

  async update(id: number, updateRestockDto: UpdateRestockDto): Promise<Restock> {
    const restock = await this.findOne(id);
    await this.restockRepository.update(id, updateRestockDto);
    return this.restockRepository.findOne({ where: { id } }) as Promise<Restock>;
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
    const restocks = await this.restockRepository.find({
      order: { createdAt: 'DESC' },
    });
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
