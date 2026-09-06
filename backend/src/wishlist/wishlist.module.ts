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
  WishlistItem,
} from './wishlist-item.entity';

import {
  WishlistController,
} from './wishlist.controller';

import {
  WishlistService,
} from './wishlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WishlistItem,
      Product,
    ]),
  ],

  controllers: [
    WishlistController,
  ],

  providers: [
    WishlistService,
    SessionGuard,
  ],
})
export class WishlistModule {}
