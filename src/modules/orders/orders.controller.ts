import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id/cancel')
  cancelByClient(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelByClient(id);
  }

  @Get('table/:tableId/bill')
  getTableBill(@Param('tableId', ParseUUIDPipe) tableId: string) {
    return this.ordersService.getTableBill(tableId);
  }


  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COCINA, UserRole.MESERO)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body('status') status: OrderStatus
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COCINA, UserRole.MESERO)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }
}