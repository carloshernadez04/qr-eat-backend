import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  async getDailyDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { totalSales } = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalSales')
      .where('order.status = :status', { status: OrderStatus.PAGADO })
      .andWhere('order.createdAt >= :today', { today })
      .getRawOne();

    const totalOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();

    const topProducts = await this.orderItemsRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .groupBy('product.id')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      date: new Date().toISOString().split('T')[0],
      totalSales: totalSales ? parseFloat(totalSales) : 0,
      totalOrders,
      topProducts: topProducts.map(p => ({
        name: p.name,
        totalSold: parseInt(p.totalSold)
      }))
    };
  }

  async getLiveRestaurantStatus() {
    const activeOrders = await this.ordersRepository.find({
      where: [
        { status: OrderStatus.PENDIENTE },
        { status: OrderStatus.PREPARANDO },
        { status: OrderStatus.LISTO },
        { status: OrderStatus.ENTREGADO },
      ],
      relations: ['table'], 
    });

    const occupiedTables = new Set(activeOrders.map(order => order.table.number));

    return {
      totalActiveOrders: activeOrders.length, 
      occupiedTablesCount: occupiedTables.size, 
      occupiedTableNumbers: Array.from(occupiedTables).sort((a, b) => a - b), 
    };
  }
}