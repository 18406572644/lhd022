import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Order } from '@/common/database/in-memory-db';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { ExcelUtil } from '@/common/utils/excel.util';

@Injectable()
export class OrderService {
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
    return db.addOrder(orderData);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Order>> {
    const { page = 1, pageSize = 10, keyword, regionId, status, startTime, endTime } = paginationDto;

    let data = [...db.getOrders()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.orderNo.toLowerCase().includes(kw) ||
          item.userId.toLowerCase().includes(kw) ||
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

  async findOne(id: number): Promise<Order> {
    const order = db.getOrders().find((o) => o.id === id);
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
    Object.assign(order, updateData);
    return order;
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
    const orders = [...db.getOrders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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
