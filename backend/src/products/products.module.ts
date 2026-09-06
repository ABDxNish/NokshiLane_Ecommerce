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
  Category,
} from '../categories/category.entity';

import {
  Product,
} from './product.entity';

import {
  ProductsController,
} from './products.controller';

import {
  ProductsService,
} from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
    ]),
  ],

  controllers: [
    ProductsController,
  ],

  providers: [
    ProductsService,
    SessionGuard,
    RolesGuard,
  ],

  exports: [
    ProductsService,
    TypeOrmModule,
  ],
})
export class ProductsModule {}
