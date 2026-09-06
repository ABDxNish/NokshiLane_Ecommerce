import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  SessionGuard,
} from '../auth/session.guard';

import {
  CartItem,
} from '../cart/cart-item.entity';

import {
  PaymentsModule,
} from '../payments/payments.module';

import {
  Product,
} from '../products/product.entity';

import {
  User,
} from '../users/user.entity';

import {
  OrderItem,
} from './order-item.entity';

import {
  Order,
} from './order.entity';

import {
  OrdersController,
} from './orders.controller';

import {
  OrdersService,
} from './orders.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      CartItem,
      User,
    ]),

    PaymentsModule,
  ],

  controllers: [
    OrdersController,
  ],

  providers: [
    OrdersService,
    SessionGuard,
    RolesGuard,
  ],
})
export class OrdersModule {}
