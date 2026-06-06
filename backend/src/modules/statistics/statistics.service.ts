import { Injectable } from '@nestjs/common';
import { db } from '@/common/database/in-memory-db';

@Injectable()
export class StatisticsService {
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const devices = db.getDevices();
    const totalDevices = devices.length;
    const onlineDevices = devices.filter((d) => d.status === 'online').length;

    const orders = db.getOrders();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= today && new Date(o.createdAt) < tomorrow,
    );
    const monthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= monthStart && new Date(o.createdAt) < monthEnd,
    );

    const todayOrderCount = todayOrders.length;
    const monthIncome = monthOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    const repairs = db.getRepairs();
    const pendingRepairs = repairs.filter((r) => r.status === 'pending' || r.status === 'processing').length;

    return {
      totalDevices,
      onlineDevices,
      todayOrders: todayOrderCount,
      monthIncome,
      pendingRepairs,
    };
  }

  async getTrend(days: number = 7) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = db.getOrders().filter(
      (o) => new Date(o.createdAt) >= startDate && new Date(o.createdAt) <= endDate,
    );

    const dateMap: { [key: string]: { date: string; orders: number; income: number } } = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = { date: dateStr, orders: 0, income: 0 };
    }

    for (const order of orders) {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].orders++;
        dateMap[dateStr].income += Number(order.amount || 0);
      }
    }

    const trendData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      days,
      list: trendData,
    };
  }
}
