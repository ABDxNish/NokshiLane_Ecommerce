import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Brackets,
  Repository,
} from 'typeorm';

import {
  Category,
} from '../categories/category.entity';

import {
  ProductDto,
} from './dto/product.dto';

import {
  ProductQueryDto,
} from './dto/product-query.dto';

import {
  Product,
} from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products:
      Repository<Product>,

    @InjectRepository(Category)
    private readonly categories:
      Repository<Category>,
  ) {}

  async list(
    query:
      ProductQueryDto,
  ) {
    const page =
      query.page || 1;

    const limit =
      query.limit || 12;

    if (
      query.minPrice !==
        undefined &&
      query.maxPrice !==
        undefined &&
      query.minPrice >
        query.maxPrice
    ) {
      throw new BadRequestException(
        'Minimum price cannot be greater than maximum price',
      );
    }

    const qb =
      this.products
        .createQueryBuilder(
          'product',
        )
        .leftJoinAndSelect(
          'product.category',
          'category',
        );

    if (
      query.search?.trim()
    ) {
      const search =
        `%${query.search.trim()}%`;

      qb.andWhere(
        new Brackets(
          (sub) => {
            sub
              .where(
                'LOWER(product.name) LIKE LOWER(:search)',
                {
                  search,
                },
              )
              .orWhere(
                'LOWER(product.description) LIKE LOWER(:search)',
                {
                  search,
                },
              )
              .orWhere(
                'LOWER(product.brand) LIKE LOWER(:search)',
                {
                  search,
                },
              )
              .orWhere(
                'LOWER(product.sku) LIKE LOWER(:search)',
                {
                  search,
                },
              );
          },
        ),
      );
    }

    if (query.category) {
      qb.andWhere(
        'category.slug = :category',
        {
          category:
            query.category,
        },
      );
    }

    if (
      query.featured ===
      'true'
    ) {
      qb.andWhere(
        'product.featured = true',
      );
    }

    if (
      query.bestseller ===
      'true'
    ) {
      qb.andWhere(
        'product.bestseller = true',
      );
    }

    if (
      query.minPrice !==
      undefined
    ) {
      qb.andWhere(
        'product.price >= :minPrice',
        {
          minPrice:
            query.minPrice,
        },
      );
    }

    if (
      query.maxPrice !==
      undefined
    ) {
      qb.andWhere(
        'product.price <= :maxPrice',
        {
          maxPrice:
            query.maxPrice,
        },
      );
    }

    switch (query.sort) {
      case 'price-asc':
        qb.orderBy(
          'product.price',
          'ASC',
        );
        break;

      case 'price-desc':
        qb.orderBy(
          'product.price',
          'DESC',
        );
        break;

      case 'rating':
        qb.orderBy(
          'product.rating',
          'DESC',
        );
        break;

      default:
        qb.orderBy(
          'product.createdAt',
          'DESC',
        );
    }

    qb
      .skip(
        (page - 1) *
          limit,
      )
      .take(limit);

    const [
      items,
      total,
    ] =
      await qb
        .getManyAndCount();

    return {
      items,
      total,
      page,

      pages:
        Math.max(
          Math.ceil(
            total / limit,
          ),
          1,
        ),
    };
  }

  async bySlug(
    slug: string,
  ) {
    const product =
      await this.products
        .findOne({
          where: {
            slug,
          },
        });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return product;
  }

  async byId(
    id: string,
  ) {
    const product =
      await this.products
        .findOne({
          where: {
            id,
          },
        });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return product;
  }

  private validatePrices(
    dto: ProductDto,
  ) {
    if (
      dto.compareAtPrice !==
        undefined &&
      dto.compareAtPrice <=
        dto.price
    ) {
      throw new BadRequestException(
        'Compare-at price must be greater than selling price',
      );
    }
  }

  async create(
    dto: ProductDto,
  ) {
    this.validatePrices(
      dto,
    );

    const slug =
      dto.slug
        .trim()
        .toLowerCase();

    const sku =
      dto.sku
        .trim()
        .toUpperCase();

    const duplicate =
      await this.products
        .createQueryBuilder(
          'product',
        )
        .where(
          'product.slug = :slug',
          {
            slug,
          },
        )
        .orWhere(
          'product.sku = :sku',
          {
            sku,
          },
        )
        .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Product slug or SKU already exists',
      );
    }

    const category =
      await this.categories
        .findOne({
          where: {
            id:
              dto.categoryId,
          },
        });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const product =
      this.products.create({
        name:
          dto.name.trim(),

        slug,
        sku,

        brand:
          dto.brand?.trim() ||
          null,

        description:
          dto.description.trim(),

        price:
          dto.price,

        compareAtPrice:
          dto.compareAtPrice ??
          null,

        stock:
          dto.stock,

        imageUrl:
          dto.imageUrl,

        images:
          dto.images ||
          [],

        featured:
          dto.featured ??
          false,

        bestseller:
          dto.bestseller ??
          false,

        rating:
          dto.rating ??
          4.5,

        reviewCount: 0,

        category,
      });

    return this.products.save(
      product,
    );
  }

  async update(
    id: string,
    dto: ProductDto,
  ) {
    this.validatePrices(
      dto,
    );

    const product =
      await this.byId(id);

    const slug =
      dto.slug
        .trim()
        .toLowerCase();

    const sku =
      dto.sku
        .trim()
        .toUpperCase();

    const duplicate =
      await this.products
        .createQueryBuilder(
          'product',
        )
        .where(
          'product.id != :id',
          {
            id,
          },
        )
        .andWhere(
          '(product.slug = :slug OR product.sku = :sku)',
          {
            slug,
            sku,
          },
        )
        .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Product slug or SKU already exists',
      );
    }

    const category =
      await this.categories
        .findOne({
          where: {
            id:
              dto.categoryId,
          },
        });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    product.name =
      dto.name.trim();

    product.slug =
      slug;

    product.sku =
      sku;

    product.brand =
      dto.brand?.trim() ||
      null;

    product.description =
      dto.description.trim();

    product.price =
      dto.price;

    product.compareAtPrice =
      dto.compareAtPrice ??
      null;

    product.stock =
      dto.stock;

    product.imageUrl =
      dto.imageUrl;

    product.images =
      dto.images || [];

    product.featured =
      dto.featured ??
      false;

    product.bestseller =
      dto.bestseller ??
      false;

    product.rating =
      dto.rating ??
      product.rating;

    product.category =
      category;

    return this.products.save(
      product,
    );
  }

  async remove(
    id: string,
  ) {
    const product =
      await this.byId(id);

    await this.products.remove(
      product,
    );

    return {
      message:
        'Product deleted successfully',
    };
  }
}
