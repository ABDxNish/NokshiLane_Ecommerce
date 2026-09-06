import {
  Controller,
  Delete,
  Get,
  Param,
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
  WishlistService,
} from './wishlist.service';

@Controller('wishlist')
@UseGuards(SessionGuard)
export class WishlistController {
  constructor(
    private readonly wishlist:
      WishlistService,
  ) {}

  @Get()
  list(
    @Req()
    req: Request,
  ) {
    return this.wishlist.list(
      req.session.user!.id,
    );
  }

  @Post(':productId/toggle')
  toggle(
    @Req()
    req: Request,

    @Param('productId')
    productId: string,
  ) {
    return this.wishlist.toggle(
      req.session.user!.id,
      productId,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    req: Request,

    @Param('id')
    id: string,
  ) {
    return this.wishlist.remove(
      req.session.user!.id,
      id,
    );
  }
}
