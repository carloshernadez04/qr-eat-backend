import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

import { TablesService } from '../tables/tables.service';
import { ProductsService } from '../products/products.service';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,

    private readonly tablesService: TablesService,
    private readonly productsService: ProductsService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const table = await this.tablesService.findOne(createOrderDto.tableId);

      const order = new Order();
      order.table = table;
      order.status = OrderStatus.PENDIENTE;
      order.total = 0;

      const savedOrder = await this.ordersRepository.save(order);

      let granTotal = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await this.productsService.findOne(itemDto.productId);

        if (!product.isAvailable) {
          throw new BadRequestException(
            `El producto '${product.name}' está agotado.`,
          );
        }

        const orderItem = new OrderItem();
        orderItem.order = savedOrder;
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.notes = itemDto.notes;

        orderItem.unitPrice = product.price;

        granTotal += product.price * itemDto.quantity;
        orderItems.push(orderItem);
      }

      await this.orderItemsRepository.save(orderItems);
      savedOrder.total = granTotal;

      const orderSaved = await this.ordersRepository.save(savedOrder);
      this.ordersGateway.notifyNewOrder(orderSaved);

      return {
        message: 'Orden creada exitosamente',
        orderSaved,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async cancelByClient(id: string) {
    try {
      const timeAccepted = 5;
      const order = await this.findOne(id);

      if (order.status !== OrderStatus.PENDIENTE) {
        throw new BadRequestException(
          'No puedes cancelar esta orden, la cocina ya comenzó a prepararla.',
        );
      }

      const now = new Date().getTime();
      const orderTime = order.createdAt.getTime();
      const minutesElapsed = Math.floor((now - orderTime) / 60000);

      if (minutesElapsed > timeAccepted) {
        throw new BadRequestException(
          `Han pasado más de ${timeAccepted} minutos. Por favor llama a un mesero para cancelar`,
        );
      }

      order.status = OrderStatus.CANCELADO;
      const result = await this.ordersRepository.save(order);
      this.ordersGateway.notifyNewOrder(result);
      return {
        message: 'Orden cancelada exitosamente',
        result,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTableBill(tableId: string) {
    try {
      const activeOrders = await this.ordersRepository.find({
        where: [
          { table: { id: tableId }, status: OrderStatus.PENDIENTE },
          { table: { id: tableId }, status: OrderStatus.PREPARANDO },
          { table: { id: tableId }, status: OrderStatus.LISTO },
          { table: { id: tableId }, status: OrderStatus.ENTREGADO },
        ],
      });

      const grandTotal = activeOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );

      return {
        tableId,
        activeOrdersCount: activeOrders.length,
        grandTotal,
        orders: activeOrders,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    this.ordersGateway.notifyNewOrder(order);
    return await this.ordersRepository.save(order);
  }
}
