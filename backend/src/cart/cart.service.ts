import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Product,
} from '../products/product.entity';

import {
  User,
} from '../users/user.entity';

import {
  CartItem,
} from './cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cart:
      Repository<CartItem>,

    @InjectRepository(Product)
    private readonly products:
      Repository<Product>,
  ) {}

  async list(
    userId: string,
  ) {
    const items =
      await this.cart.find({
        where: {
          user: {
            id: userId,
          },
        },

        order: {
          id: 'DESC',
        },
      });

    const subtotal =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          Number(
            item.product.price,
          ) *
            item.quantity,
        0,
      );

    const totalQuantity =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.quantity,
        0,
      );

    return {
      items,
      subtotal,
      totalQuantity,
    };
  }

  async add(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    const product =
      await this.products
        .findOne({
          where: {
            id: productId,
          },
        });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    if (
      product.stock <= 0
    ) {
      throw new BadRequestException(
        'This product is out of stock',
      );
    }

    let existing =
      await this.cart.findOne({
        where: {
          user: {
            id: userId,
          },

          product: {
            id: productId,
          },
        },
      });

    if (existing) {
      const nextQuantity =
        existing.quantity +
        quantity;

      if (
        nextQuantity >
        product.stock
      ) {
        throw new BadRequestException(
          `Only ${product.stock} item(s) are available`,
        );
      }

      if (
        nextQuantity > 20
      ) {
        throw new BadRequestException(
          'Maximum cart quantity is 20 per product',
        );
      }

      existing.quantity =
        nextQuantity;

      return this.cart.save(
        existing,
      );
    }

    if (
      quantity >
      product.stock
    ) {
      throw new BadRequestException(
        `Only ${product.stock} item(s) are available`,
      );
    }

    existing =
      this.cart.create({
        quantity,

        user: {
          id: userId,
        } as User,

        product,
      });

    return this.cart.save(
      existing,
    );
  }

  async update(
    userId: string,
    id: string,
    quantity: number,
  ) {
    const item =
      await this.cart.findOne({
        where: {
          id,

          user: {
            id: userId,
          },
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    const product =
      await this.products
        .findOne({
          where: {
            id:
              item.product.id,
          },
        });

    if (!product) {
      throw new NotFoundException(
        'Product no longer exists',
      );
    }

    if (
      quantity >
      product.stock
    ) {
      throw new BadRequestException(
        `Only ${product.stock} item(s) are available`,
      );
    }

    item.quantity =
      quantity;

    return this.cart.save(
      item,
    );
  }

  async remove(
    userId: string,
    id: string,
  ) {
    const item =
      await this.cart.findOne({
        where: {
          id,

          user: {
            id: userId,
          },
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    await this.cart.remove(
      item,
    );

    return {
      message:
        'Product removed from cart',
    };
  }

  async clear(
    userId: string,
  ) {
    const items =
      await this.cart.find({
        where: {
          user: {
            id: userId,
          },
        },
      });

    if (items.length) {
      await this.cart.remove(
        items,
      );
    }

    return {
      message:
        'Cart cleared',
    };
  }
}
