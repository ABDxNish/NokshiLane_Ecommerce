import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  SessionGuard,
} from '../auth/session.guard';

import {
  Product,
} from '../products/product.entity';

import {
  CartItem,
} from './cart-item.entity';

import {
  CartController,
} from './cart.controller';

import {
  CartService,
} from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Product,
    ]),
  ],

  controllers: [
    CartController,
  ],

  providers: [
    CartService,
    SessionGuard,
  ],

  exports: [
    CartService,
    TypeOrmModule,
  ],
})
export class CartModule {}
