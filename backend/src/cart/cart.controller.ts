import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  Request,
} from 'express';

import {
  SessionGuard,
} from '../auth/session.guard';

import {
  CartService,
} from './cart.service';

import {
  AddCartDto,
  UpdateCartDto,
} from './dto/cart.dto';

@Controller('cart')
@UseGuards(SessionGuard)
export class CartController {
  constructor(
    private readonly cart:
      CartService,
  ) {}

  @Get()
  list(
    @Req()
    req: Request,
  ) {
    return this.cart.list(
      req.session.user!.id,
    );
  }

  @Post()
  add(
    @Req()
    req: Request,

    @Body()
    dto: AddCartDto,
  ) {
    return this.cart.add(
      req.session.user!.id,
      dto.productId,
      dto.quantity,
    );
  }

  @Patch(':id')
  update(
    @Req()
    req: Request,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateCartDto,
  ) {
    return this.cart.update(
      req.session.user!.id,
      id,
      dto.quantity,
    );
  }

  @Delete('clear')
  clear(
    @Req()
    req: Request,
  ) {
    return this.cart.clear(
      req.session.user!.id,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    req: Request,

    @Param('id')
    id: string,
  ) {
    return this.cart.remove(
      req.session.user!.id,
      id,
    );
  }
}
