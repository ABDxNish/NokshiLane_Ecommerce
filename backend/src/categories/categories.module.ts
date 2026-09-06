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
} from './category.entity';

import {
  CategoriesController,
} from './categories.controller';

import {
  CategoriesService,
} from './categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
    ]),
  ],

  controllers: [
    CategoriesController,
  ],

  providers: [
    CategoriesService,
    SessionGuard,
    RolesGuard,
  ],

  exports: [
    CategoriesService,
    TypeOrmModule,
  ],
})
export class CategoriesModule {}
