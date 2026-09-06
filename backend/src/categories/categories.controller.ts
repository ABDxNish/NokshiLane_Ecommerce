import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  CategoriesService,
} from './categories.service';

import {
  CategoryDto,
} from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categories:
      CategoriesService,
  ) {}

  @Get()
  all() {
    return this.categories.all();
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
    dto: CategoryDto,
  ) {
    return this.categories
      .create(dto);
  }

  @Patch(':id')
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
    dto: CategoryDto,
  ) {
    return this.categories
      .update(
        id,
        dto,
      );
  }

  @Delete(':id')
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
    return this.categories
      .remove(id);
  }
}
