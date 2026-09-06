import {
  All,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  Request,
  Response,
} from 'express';

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
  CheckoutDto,
} from './dto/checkout.dto';

import {
  OrderStatusDto,
} from './dto/order-status.dto';

import {
  PaymentStatus,
} from './order.entity';

import {
  OrdersService,
} from './orders.service';


@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders:
      OrdersService,
  ) {}


  @Post('checkout')
  @UseGuards(
    SessionGuard,
  )
  checkout(
    @Req()
    req: Request,

    @Body()
    dto: CheckoutDto,
  ) {
    return this.orders
      .checkout(
        req.session.user!.id,
        dto,
      );
  }


  @Get('my')
  @UseGuards(
    SessionGuard,
  )
  myOrders(
    @Req()
    req: Request,
  ) {
    return this.orders
      .myOrders(
        req.session.user!.id,
      );
  }


  @Get('admin/all')
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  allOrders() {
    return this.orders
      .allOrders();
  }


  @Patch(
    'admin/:id/status',
  )
  @UseGuards(
    SessionGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
  )
  updateStatus(
    @Param('id')
    id: string,

    @Body()
    dto:
      OrderStatusDto,
  ) {
    return this.orders
      .updateStatus(
        id,
        dto.status,
      );
  }


  /*
   * IMPORTANT:
   * These static payment routes are
   * intentionally placed BEFORE @Get(':id')
   * so they cannot be confused with
   * an order ID route.
   */


  @All('payment/success')
  async paymentSuccess(
    @Body()
    body:
      Record<
        string,
        string | undefined
      >,

    @Query()
    query:
      Record<
        string,
        string | undefined
      >,

    @Res()
    res: Response,
  ) {
    try {
      const order =
        await this.orders
          .confirmOnlinePayment({
            ...query,
            ...body,
          });


      return res.redirect(
        this.orders
          .frontendUrl(
            `/payment/success?order=${encodeURIComponent(
              order.orderNumber,
            )}`,
          ),
      );
    } catch {
      return res.redirect(
        this.orders
          .frontendUrl(
            '/payment/fail',
          ),
      );
    }
  }


  @All('payment/fail')
  async paymentFail(
    @Body()
    body:
      Record<
        string,
        string | undefined
      >,

    @Query()
    query:
      Record<
        string,
        string | undefined
      >,

    @Res()
    res: Response,
  ) {
    const transactionId =
      body.tran_id ||
      query.tran_id;


    if (transactionId) {
      await this.orders
        .cancelAndRestoreByTransaction(
          transactionId,

          PaymentStatus.FAILED,
        )
        .catch(
          () => undefined,
        );
    }


    return res.redirect(
      this.orders
        .frontendUrl(
          '/payment/fail',
        ),
    );
  }


  @All('payment/cancel')
  async paymentCancel(
    @Body()
    body:
      Record<
        string,
        string | undefined
      >,

    @Query()
    query:
      Record<
        string,
        string | undefined
      >,

    @Res()
    res: Response,
  ) {
    const transactionId =
      body.tran_id ||
      query.tran_id;


    if (transactionId) {
      await this.orders
        .cancelAndRestoreByTransaction(
          transactionId,

          PaymentStatus.CANCELLED,
        )
        .catch(
          () => undefined,
        );
    }


    return res.redirect(
      this.orders
        .frontendUrl(
          '/payment/cancel',
        ),
    );
  }


  @Post('payment/ipn')
  async paymentIpn(
    @Body()
    body:
      Record<
        string,
        string | undefined
      >,
  ) {
    await this.orders
      .handleIpn(body);


    return {
      received: true,
    };
  }


  @Get(':id')
  @UseGuards(
    SessionGuard,
  )
  detail(
    @Req()
    req: Request,

    @Param('id')
    id: string,
  ) {
    return this.orders
      .detail(
        req.session.user!.id,

        id,

        req.session.user!
          .role ===
          UserRole.ADMIN,
      );
  }
}
