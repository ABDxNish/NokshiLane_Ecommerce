import {
  IsEnum,
} from 'class-validator';

import {
  OrderStatus,
} from '../order.entity';


export class OrderStatusDto {
  @IsEnum(OrderStatus)
  status:
    OrderStatus;
}
