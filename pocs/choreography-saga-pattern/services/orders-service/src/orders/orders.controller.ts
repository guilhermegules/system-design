import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.orders.createOrder(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    const order = await this.orders.getOrderCached(id);
    return this.orders.requireOrder(order);
  }

  @Get()
  async findByCustomer(@Query('customerId') customerId?: string): Promise<Order[]> {
    if (!customerId) return [];
    return this.orders.listByCustomerCached(customerId);
  }
}
