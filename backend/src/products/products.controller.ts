import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
} from '../auth/auth.types';

import {
  Roles,
} from '../auth/roles.decorator';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  SessionGuard,
} from '../auth/session.guard';

import {
  ProductDto,
} from './dto/product.dto';

import {
  ProductQueryDto,
} from './dto/product-query.dto';

import {
  ProductsService,
} from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly products:
      ProductsService,
  ) {}

  @Get()
  list(
    @Query()
    query: ProductQueryDto,
  ) {
    return this.products.list(
      query,
    );
  }

  @Get('id/:id')
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  byId(
    @Param('id')
    id: string,
  ) {
    return this.products.byId(
      id,
    );
  }

  @Get(':slug')
  bySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.products
      .bySlug(slug);
  }

  @Post()
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  create(
    @Body()
    dto: ProductDto,
  ) {
    return this.products
      .create(dto);
  }

  @Patch('id/:id')
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  update(
    @Param('id')
    id: string,

    @Body()
    dto: ProductDto,
  ) {
    return this.products
      .update(
        id,
        dto,
      );
  }

  @Delete('id/:id')
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  remove(
    @Param('id')
    id: string,
  ) {
    return this.products
      .remove(id);
  }
}
