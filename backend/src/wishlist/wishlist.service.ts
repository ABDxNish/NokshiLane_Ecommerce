import {
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
  WishlistItem,
} from './wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlist:
      Repository<WishlistItem>,

    @InjectRepository(Product)
    private readonly products:
      Repository<Product>,
  ) {}

  list(
    userId: string,
  ) {
    return this.wishlist.find({
      where: {
        user: {
          id: userId,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  async toggle(
    userId: string,
    productId: string,
  ) {
    const existing =
      await this.wishlist
        .findOne({
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
      await this.wishlist
        .remove(existing);

      return {
        wished: false,

        message:
          'Removed from wishlist',
      };
    }

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

    await this.wishlist.save(
      this.wishlist.create({
        user: {
          id: userId,
        } as User,

        product,
      }),
    );

    return {
      wished: true,

      message:
        'Added to wishlist',
    };
  }

  async remove(
    userId: string,
    id: string,
  ) {
    const item =
      await this.wishlist
        .findOne({
          where: {
            id,

            user: {
              id: userId,
            },
          },
        });

    if (!item) {
      throw new NotFoundException(
        'Wishlist item not found',
      );
    }

    await this.wishlist.remove(
      item,
    );

    return {
      message:
        'Removed from wishlist',
    };
  }
}
