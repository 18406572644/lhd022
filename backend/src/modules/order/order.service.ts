import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/entities/order.entity';
import { Point } from '@/entities/point.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Point) private pointRepository: Repository<Point>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = ExcelUtil.generateNo('DD');
    const orderData = {
      ...createOrderDto,
      orderNo,
      duration: createOrderDto.duration || 0,
      amount: createOrderDto.amount || 0,
      status: createOrderDto.status || 'renting',
      rentTime: new Date(createOrderDto.rentTime),
      returnTime: createOrderDto.returnTime ? new Date(createOrderDto.returnTime) : null,
    };
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Order>> {
    const { regionId } = paginationDto;

    if (regionId !== undefined) {
      const points = await this.pointRepository.find({
        where: { regionId: Number(regionId) },
        select: ['id'],
      });
      const pointIds = points.map((p) => p.id);

      const modifiedPaginationDto = { ...paginationDto, regionId: undefined };
      const result = await QueryUtil.findWithPagination<Order>(
        this.orderRepository,
        modifiedPaginationDto,
        ['orderNo', 'userId', 'type'],
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

    return QueryUtil.findWithPagination<Order>(
      this.orderRepository,
      paginationDto,
      ['orderNo', 'userId', 'type'],
    );
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const updateData: any = { ...updateOrderDto };
    if (updateOrderDto.rentTime) {
      updateData.rentTime = new Date(updateOrderDto.rentTime);
    }
    if (updateOrderDto.returnTime !== undefined) {
      updateData.returnTime = updateOrderDto.returnTime ? new Date(updateOrderDto.returnTime) : null;
    }
    await this.orderRepository.update(id, updateData);
    return this.orderRepository.findOne({ where: { id } }) as Promise<Order>;
  }

  async remove(id: number): Promise<void> {
    throw new NotFoundException('订单不支持删除');
  }

  async import(file: Express.Multer.File): Promise<{ success: number; fail: number; total: number }> {
    const data = ExcelUtil.importExcel(file);
    let success = 0;
    let fail = 0;

    for (const item of data) {
      try {
        const orderData: CreateOrderDto = {
          userId: item['用户ID'] || item['userId'],
          deviceId: Number(item['设备ID'] || item['deviceId']),
          pointId: Number(item['点位ID'] || item['pointId']),
          type: item['类型'] || item['type'],
          rentTime: item['租借时间'] || item['rentTime'],
          returnTime: item['归还时间'] || item['returnTime'],
          duration: item['时长'] || item['duration'] ? Number(item['时长'] || item['duration']) : 0,
          amount: item['费用'] || item['amount'] ? Number(item['费用'] || item['amount']) : 0,
          status: item['状态'] || item['status'] || 'renting',
        };
        await this.create(orderData);
        success++;
      } catch (error) {
        fail++;
      }
    }

    return { success, fail, total: data.length };
  }

  async export(): Promise<Buffer> {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
    const exportData = orders.map((order) => ({
      ID: order.id,
      订单号: order.orderNo,
      用户ID: order.userId,
      设备ID: order.deviceId,
      点位ID: order.pointId,
      类型: order.type,
      租借时间: order.rentTime,
      归还时间: order.returnTime,
      时长: order.duration,
      费用: order.amount,
      状态: order.status,
      创建时间: order.createdAt,
    }));
    return ExcelUtil.exportExcel(exportData, '订单数据');
  }
}
