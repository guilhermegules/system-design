import { OrderService } from '@application/order.service';
import { Order } from '@domain/order';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.orders.createOrder(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    const order = await this.orders.getOrderCached(id);
    if (!order) throw new NotFoundException('order not found');
    return order;
  }

  @Get()
  async findByCustomer(@Query('customerId') customerId?: string): Promise<Order[]> {
    if (!customerId) return [];
    return this.orders.listByCustomerCached(customerId);
  }
}
