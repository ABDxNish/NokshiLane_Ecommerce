import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  DataSource,
  EntityManager,
  Repository,
} from 'typeorm';

import {
  CartItem,
} from '../cart/cart-item.entity';

import {
  MailService,
} from '../integrations/mail.service';

import {
  RealtimeService,
} from '../integrations/realtime.service';

import {
  SslCommerzService,
} from '../payments/sslcommerz.service';

import {
  Product,
} from '../products/product.entity';

import {
  User,
} from '../users/user.entity';

import {
  CheckoutDto,
} from './dto/checkout.dto';

import {
  OrderItem,
} from './order-item.entity';

import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './order.entity';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders:
      Repository<Order>,

    private readonly dataSource:
      DataSource,

    private readonly ssl:
      SslCommerzService,

    private readonly realtime:
      RealtimeService,

    private readonly mail:
      MailService,

    private readonly config:
      ConfigService,
  ) {}


  // =========================================================
  // HELPERS
  // =========================================================

  private orderNumber() {
    const random =
      Math.floor(
        Math.random() * 9000 +
        1000,
      );

    return `NK-${Date.now()
      .toString()
      .slice(-8)}-${random}`;
  }


  private transactionId() {
    const random =
      Math.floor(
        Math.random() * 9000 +
        1000,
      );

    return `NK${Date.now()}${random}`
      .slice(
        0,
        30,
      );
  }


  private shippingFee(
    city: string,
  ) {
    return (
      city
        .trim()
        .toLowerCase() ===
      'dhaka'
        ? 80
        : 120
    );
  }


  // =========================================================
  // CHECKOUT
  // =========================================================

  async checkout(
    userId: string,
    dto: CheckoutDto,
  ) {
    const created =
      await this.dataSource
        .transaction(
          async (
            manager,
          ) => {
            const userRepo =
              manager.getRepository(
                User,
              );

            const cartRepo =
              manager.getRepository(
                CartItem,
              );

            const productRepo =
              manager.getRepository(
                Product,
              );

            const orderRepo =
              manager.getRepository(
                Order,
              );

            const itemRepo =
              manager.getRepository(
                OrderItem,
              );


            // -----------------------------------------------
            // USER
            // -----------------------------------------------

            const user =
              await userRepo.findOne({
                where: {
                  id: userId,
                },
              });


            if (!user) {
              throw new NotFoundException(
                'User not found',
              );
            }


            // -----------------------------------------------
            // CART
            // -----------------------------------------------

            const cart =
              await cartRepo.find({
                where: {
                  user: {
                    id: userId,
                  },
                },

                relations: {
                  product:
                    true,
                },
              });


            if (!cart.length) {
              throw new BadRequestException(
                'Your cart is empty',
              );
            }


            let subtotal = 0;


            const lockedProducts =
              new Map<
                string,
                Product
              >();


            // -----------------------------------------------
            // LOCK PRODUCTS + VALIDATE STOCK
            // -----------------------------------------------

            for (
              const cartItem
              of cart
            ) {
              /*
               * IMPORTANT:
               *
               * Do NOT use:
               *
               * productRepo.findOne({
               *   lock: {
               *     mode: 'pessimistic_write'
               *   }
               * })
               *
               * Product.category is eager.
               * TypeORM may generate LEFT JOIN + FOR UPDATE.
               * PostgreSQL rejects FOR UPDATE on nullable
               * side of an OUTER JOIN.
               *
               * QueryBuilder below locks ONLY products table.
               */

              const product =
                await productRepo
                  .createQueryBuilder(
                    'product',
                  )
                  .setLock(
                    'pessimistic_write',
                  )
                  .where(
                    'product.id = :id',
                    {
                      id:
                        cartItem
                          .product
                          .id,
                    },
                  )
                  .getOne();


              if (!product) {
                throw new NotFoundException(
                  'A product in your cart no longer exists',
                );
              }


              if (
                cartItem.quantity <= 0
              ) {
                throw new BadRequestException(
                  'Invalid cart quantity',
                );
              }


              if (
                cartItem.quantity > 20
              ) {
                throw new BadRequestException(
                  'Maximum quantity is 20 per product',
                );
              }


              if (
                product.stock <
                cartItem.quantity
              ) {
                throw new BadRequestException(
                  `${product.name} only has ${product.stock} item(s) available`,
                );
              }


              lockedProducts.set(
                product.id,
                product,
              );


              subtotal +=
                Number(
                  product.price,
                ) *
                cartItem.quantity;
            }


            subtotal =
              Number(
                subtotal.toFixed(
                  2,
                ),
              );


            // -----------------------------------------------
            // DELIVERY
            // -----------------------------------------------

            const deliveryFee =
              this.shippingFee(
                dto.city,
              );


            const total =
              Number(
                (
                  subtotal +
                  deliveryFee
                ).toFixed(
                  2,
                ),
              );


            const online =
              dto.paymentMethod ===
              PaymentMethod.SSLCOMMERZ;


            // -----------------------------------------------
            // CREATE ORDER
            // -----------------------------------------------

            const order =
              orderRepo.create({
                orderNumber:
                  this.orderNumber(),

                transactionId:
                  online
                    ? this.transactionId()
                    : null,

                recipientName:
                  dto.recipientName
                    .trim(),

                phone:
                  dto.phone
                    .trim(),

                address:
                  dto.address
                    .trim(),

                city:
                  dto.city
                    .trim(),

                area:
                  dto.area
                    .trim(),

                postcode:
                  dto.postcode
                    ?.trim() ||
                  null,

                subtotal,

                shippingFee:
                  deliveryFee,

                total,

                paymentMethod:
                  dto.paymentMethod,

                paymentStatus:
                  online
                    ? PaymentStatus.PENDING
                    : PaymentStatus.UNPAID,

                status:
                  online
                    ? OrderStatus.PENDING_PAYMENT
                    : OrderStatus.CONFIRMED,

                stockRestored:
                  false,

                user,
              });


            const savedOrder =
              await orderRepo.save(
                order,
              );


            // -----------------------------------------------
            // ORDER ITEMS + STOCK REDUCTION
            // -----------------------------------------------

            const orderItems:
              OrderItem[] = [];


            for (
              const cartItem
              of cart
            ) {
              const product =
                lockedProducts.get(
                  cartItem
                    .product
                    .id,
                );


              if (!product) {
                throw new BadRequestException(
                  'Unable to process a cart product',
                );
              }


              product.stock -=
                cartItem.quantity;


              await productRepo.save(
                product,
              );


              const orderItem =
                itemRepo.create({
                  productId:
                    product.id,

                  productName:
                    product.name,

                  sku:
                    product.sku,

                  imageUrl:
                    product.imageUrl,

                  unitPrice:
                    Number(
                      product.price,
                    ),

                  quantity:
                    cartItem.quantity,

                  order:
                    savedOrder,
                });


              orderItems.push(
                orderItem,
              );
            }


            await itemRepo.save(
              orderItems,
            );


            // -----------------------------------------------
            // CLEAR CART
            // -----------------------------------------------

            /*
             * We already loaded all cart entities,
             * so remove them directly.
             *
             * This is safer than depending on generated
             * foreign-key column name such as "userId".
             */

            if (
              cart.length > 0
            ) {
              await cartRepo.remove(
                cart,
              );
            }


            savedOrder.items =
              orderItems;


            return {
              order:
                savedOrder,

              user,
            };
          },
        );


    // =======================================================
    // REALTIME ADMIN NOTIFICATION
    // =======================================================

    await this.realtime
      .notifyAdmin({
        title:
          'New order',

        message:
          `${created.order.orderNumber} — BDT ${Number(
            created.order.total,
          ).toFixed(2)}`,

        orderId:
          created.order.id,
      })
      .catch(
        () => undefined,
      );


    // =======================================================
    // ORDER EMAIL
    // =======================================================

    await this.mail
      .orderConfirmation(
        created.user.email,

        created.order
          .orderNumber,

        Number(
          created.order.total,
        ),
      )
      .catch(
        () => undefined,
      );


    // =======================================================
    // SSLCOMMERZ
    // =======================================================

    if (
      created.order
        .paymentMethod ===
      PaymentMethod.SSLCOMMERZ
    ) {
      try {
        const payment =
          await this.ssl
            .initiate(
              created.order,
              created.user,
            );


        return {
          order:
            created.order,

          paymentUrl:
            payment.paymentUrl,
        };
      } catch (error) {
        /*
         * Payment gateway initiation failed.
         *
         * Order was already created and stock
         * was reserved, so restore inventory.
         */

        if (
          created.order
            .transactionId
        ) {
          await this
            .cancelAndRestoreByTransaction(
              created.order
                .transactionId,

              PaymentStatus.FAILED,
            )
            .catch(
              () => undefined,
            );
        }


        throw error;
      }
    }


    // =======================================================
    // COD RESPONSE
    // =======================================================

    return {
      order:
        created.order,

      paymentUrl:
        null,
    };
  }


  // =========================================================
  // CUSTOMER ORDERS
  // =========================================================

  async myOrders(
    userId: string,
  ) {
    return this.orders.find({
      where: {
        user: {
          id: userId,
        },
      },

      order: {
        createdAt:
          'DESC',
      },
    });
  }


  // =========================================================
  // ADMIN ORDERS
  // =========================================================

  async allOrders() {
    return this.orders.find({
      order: {
        createdAt:
          'DESC',
      },
    });
  }


  // =========================================================
  // ORDER DETAIL
  // =========================================================

  async detail(
    userId: string,
    id: string,
    admin = false,
  ) {
    const order =
      await this.orders
        .findOne({
          where: {
            id,
          },
        });


    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }


    if (
      !admin &&
      order.user.id !==
        userId
    ) {
      throw new NotFoundException(
        'Order not found',
      );
    }


    return order;
  }


  // =========================================================
  // ADMIN ORDER STATUS
  // =========================================================

  async updateStatus(
    id: string,
    nextStatus:
      OrderStatus,
  ) {
    const order =
      await this.orders
        .findOne({
          where: {
            id,
          },
        });


    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }


    if (
      order.status ===
      OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cancelled orders cannot be updated',
      );
    }


    if (
      order.status ===
        OrderStatus.DELIVERED &&
      nextStatus !==
        OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Delivered orders cannot be moved to another status',
      );
    }


    /*
     * Online order cannot proceed until
     * payment has actually been verified.
     */

    if (
      order.paymentMethod ===
        PaymentMethod.SSLCOMMERZ &&
      order.paymentStatus !==
        PaymentStatus.PAID &&
      nextStatus !==
        OrderStatus.CANCELLED &&
      nextStatus !==
        OrderStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException(
        'Online payment must be verified before processing the order',
      );
    }


    // --------------------------------------------------------
    // CANCEL
    // --------------------------------------------------------

    if (
      nextStatus ===
      OrderStatus.CANCELLED
    ) {
      if (
        order.paymentMethod ===
          PaymentMethod.SSLCOMMERZ &&
        order.paymentStatus ===
          PaymentStatus.PAID
      ) {
        throw new BadRequestException(
          'A paid online order cannot be cancelled here. Use the merchant refund process.',
        );
      }


      return this
        .cancelAndRestoreById(
          id,
          PaymentStatus.CANCELLED,
        );
    }


    // --------------------------------------------------------
    // VALID STATUS FLOW
    // --------------------------------------------------------

    const allowed:
      Record<
        OrderStatus,
        OrderStatus[]
      > = {
        [OrderStatus.PENDING_PAYMENT]:
          [
            OrderStatus.CONFIRMED,
          ],

        [OrderStatus.CONFIRMED]:
          [
            OrderStatus.PROCESSING,
          ],

        [OrderStatus.PROCESSING]:
          [
            OrderStatus.SHIPPED,
          ],

        [OrderStatus.SHIPPED]:
          [
            OrderStatus.DELIVERED,
          ],

        [OrderStatus.DELIVERED]:
          [],

        [OrderStatus.CANCELLED]:
          [],
      };


    if (
      order.status !==
        nextStatus &&
      !allowed[
        order.status
      ].includes(
        nextStatus,
      )
    ) {
      throw new BadRequestException(
        `Invalid status change from ${order.status} to ${nextStatus}`,
      );
    }


    order.status =
      nextStatus;


    /*
     * COD is considered PAID
     * once delivery is completed.
     */

    if (
      nextStatus ===
        OrderStatus.DELIVERED &&
      order.paymentMethod ===
        PaymentMethod.COD
    ) {
      order.paymentStatus =
        PaymentStatus.PAID;
    }


    const saved =
      await this.orders.save(
        order,
      );


    // --------------------------------------------------------
    // PUSHER
    // --------------------------------------------------------

    await this.realtime
      .notifyUser(
        order.user.id,
        {
          title:
            'Order updated',

          message:
            `${order.orderNumber} is now ${nextStatus.replaceAll(
              '_',
              ' ',
            )}`,

          orderId:
            order.id,
        },
      )
      .catch(
        () => undefined,
      );


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    await this.mail
      .orderStatus(
        order.user.email,

        order.orderNumber,

        nextStatus,
      )
      .catch(
        () => undefined,
      );


    return saved;
  }


  // =========================================================
  // VERIFY ONLINE PAYMENT
  // =========================================================

  async confirmOnlinePayment(
    payload:
      Record<
        string,
        string | undefined
      >,
  ) {
    const valId =
      payload.val_id;

    const transactionId =
      payload.tran_id;


    if (
      !valId ||
      !transactionId
    ) {
      throw new BadRequestException(
        'Missing payment validation information',
      );
    }


    /*
     * IMPORTANT:
     * Validate directly with SSLCOMMERZ.
     */

    const validation =
      await this.ssl
        .validate(
          valId,
        );


    const order =
      await this.orders
        .findOne({
          where: {
            transactionId,
          },
        });


    if (!order) {
      throw new NotFoundException(
        'Payment order not found',
      );
    }


    if (
      order.paymentMethod !==
      PaymentMethod.SSLCOMMERZ
    ) {
      throw new BadRequestException(
        'This is not an online payment order',
      );
    }


    /*
     * Idempotent:
     * duplicate callbacks won't
     * process payment twice.
     */

    if (
      order.paymentStatus ===
      PaymentStatus.PAID
    ) {
      return order;
    }


    if (
      order.status ===
      OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'This order has already been cancelled',
      );
    }


    const validStatus =
      [
        'VALID',
        'VALIDATED',
      ].includes(
        validation.status ||
        '',
      );


    const transactionMatches =
      validation.tran_id ===
      order.transactionId;


    const paidAmount =
      Number(
        validation.amount,
      );


    const orderAmount =
      Number(
        order.total,
      );


    const amountMatches =
      Number.isFinite(
        paidAmount,
      ) &&
      Math.abs(
        paidAmount -
        orderAmount,
      ) < 0.01;


    const currencyMatches =
      validation.currency ===
      'BDT';


    if (!validStatus) {
      throw new BadRequestException(
        'SSLCOMMERZ did not validate this transaction',
      );
    }


    if (!transactionMatches) {
      throw new BadRequestException(
        'Transaction ID does not match the order',
      );
    }


    if (!amountMatches) {
      throw new BadRequestException(
        'Payment amount does not match the order total',
      );
    }


    if (!currencyMatches) {
      throw new BadRequestException(
        'Payment currency does not match BDT',
      );
    }


    /*
     * Risk level 1 should be reviewed manually.
     */

    if (
      String(
        validation.risk_level ||
        '0',
      ) === '1'
    ) {
      throw new BadRequestException(
        'Payment was marked as risky and requires manual merchant review',
      );
    }


    order.paymentStatus =
      PaymentStatus.PAID;

    order.status =
      OrderStatus.CONFIRMED;


    const saved =
      await this.orders.save(
        order,
      );


    await this.realtime
      .notifyUser(
        order.user.id,
        {
          title:
            'Payment successful',

          message:
            `${order.orderNumber} payment has been verified`,

          orderId:
            order.id,
        },
      )
      .catch(
        () => undefined,
      );


    await this.mail
      .send(
        order.user.email,

        `Payment received — ${order.orderNumber}`,

        [
          'Your NokshiLane payment was successfully verified.',
          '',
          `Order: ${order.orderNumber}`,
          `Amount: BDT ${Number(
            order.total,
          ).toFixed(2)}`,
          '',
          'Your order is now confirmed.',
        ].join('\n'),
      )
      .catch(
        () => undefined,
      );


    return saved;
  }


  // =========================================================
  // IPN
  // =========================================================

  async handleIpn(
    payload:
      Record<
        string,
        string | undefined
      >,
  ) {
    const status =
      payload.status;

    const transactionId =
      payload.tran_id;


    if (
      [
        'VALID',
        'VALIDATED',
      ].includes(
        status ||
        '',
      )
    ) {
      return this
        .confirmOnlinePayment(
          payload,
        );
    }


    if (
      transactionId &&
      status ===
        'FAILED'
    ) {
      return this
        .cancelAndRestoreByTransaction(
          transactionId,
          PaymentStatus.FAILED,
        );
    }


    if (
      transactionId &&
      (
        status ===
          'CANCELLED' ||
        status ===
          'CANCEL'
      )
    ) {
      return this
        .cancelAndRestoreByTransaction(
          transactionId,
          PaymentStatus.CANCELLED,
        );
    }


    return {
      received: true,
    };
  }


  // =========================================================
  // CANCEL USING TRANSACTION ID
  // =========================================================

  async cancelAndRestoreByTransaction(
    transactionId:
      string,

    paymentStatus:
      PaymentStatus,
  ) {
    return this.dataSource
      .transaction(
        async (
          manager,
        ) => {
          const orderRepo =
            manager.getRepository(
              Order,
            );

          const itemRepo =
            manager.getRepository(
              OrderItem,
            );


          /*
           * Lock ONLY the orders table.
           *
           * Avoid eager JOIN + FOR UPDATE.
           */

          const order =
            await orderRepo
              .createQueryBuilder(
                'order',
              )
              .setLock(
                'pessimistic_write',
              )
              .where(
                'order.transactionId = :transactionId',
                {
                  transactionId,
                },
              )
              .getOne();


          if (!order) {
            throw new NotFoundException(
              'Order not found',
            );
          }


          /*
           * QueryBuilder does not automatically
           * load eager relations here.
           *
           * Load order items separately.
           */

          order.items =
            await itemRepo.find({
              where: {
                order: {
                  id:
                    order.id,
                },
              },
            });


          return this
            .restoreAndCancel(
              manager,
              order,
              paymentStatus,
            );
        },
      );
  }


  // =========================================================
  // CANCEL USING ORDER ID
  // =========================================================

  async cancelAndRestoreById(
    id: string,

    paymentStatus:
      PaymentStatus,
  ) {
    return this.dataSource
      .transaction(
        async (
          manager,
        ) => {
          const orderRepo =
            manager.getRepository(
              Order,
            );

          const itemRepo =
            manager.getRepository(
              OrderItem,
            );


          const order =
            await orderRepo
              .createQueryBuilder(
                'order',
              )
              .setLock(
                'pessimistic_write',
              )
              .where(
                'order.id = :id',
                {
                  id,
                },
              )
              .getOne();


          if (!order) {
            throw new NotFoundException(
              'Order not found',
            );
          }


          order.items =
            await itemRepo.find({
              where: {
                order: {
                  id:
                    order.id,
                },
              },
            });


          return this
            .restoreAndCancel(
              manager,
              order,
              paymentStatus,
            );
        },
      );
  }


  // =========================================================
  // STOCK RESTORE
  // =========================================================

  private async restoreAndCancel(
    manager:
      EntityManager,

    order:
      Order,

    paymentStatus:
      PaymentStatus,
  ) {
    /*
     * Never restore stock for a payment
     * that has already been confirmed PAID.
     */

    if (
      order.paymentStatus ===
      PaymentStatus.PAID
    ) {
      return order;
    }


    /*
     * stockRestored protects against:
     *
     * fail callback
     * cancel callback
     * IPN callback
     *
     * all arriving for the same order.
     */

    if (
      !order.stockRestored
    ) {
      const productRepo =
        manager.getRepository(
          Product,
        );


      for (
        const item
        of order.items
      ) {
        /*
         * Again:
         * lock ONLY products table.
         */

        const product =
          await productRepo
            .createQueryBuilder(
              'product',
            )
            .setLock(
              'pessimistic_write',
            )
            .where(
              'product.id = :id',
              {
                id:
                  item.productId,
              },
            )
            .getOne();


        if (product) {
          product.stock +=
            item.quantity;


          await productRepo
            .save(
              product,
            );
        }
      }


      order.stockRestored =
        true;
    }


    order.paymentStatus =
      paymentStatus;

    order.status =
      OrderStatus.CANCELLED;


    return manager
      .getRepository(
        Order,
      )
      .save(
        order,
      );
  }


  // =========================================================
  // FRONTEND REDIRECT URL
  // =========================================================

  frontendUrl(
    path: string,
  ) {
    const base =
      this.config.get<string>(
        'FRONTEND_URL',
      ) ||
      'http://localhost:3200';


    return `${base}${path}`;
  }
}