import {
  ConflictException,
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
  Category,
} from './category.entity';

import {
  CategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories:
      Repository<Category>,
  ) {}

  all() {
    return this.categories.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async one(
    id: string,
  ) {
    const category =
      await this.categories
        .findOne({
          where: {
            id,
          },
        });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    return category;
  }

  async create(
    dto: CategoryDto,
  ) {
    const name =
      dto.name.trim();

    const slug =
      dto.slug
        .trim()
        .toLowerCase();

    const duplicate =
      await this.categories
        .createQueryBuilder(
          'category',
        )
        .where(
          'LOWER(category.name) = LOWER(:name)',
          {
            name,
          },
        )
        .orWhere(
          'category.slug = :slug',
          {
            slug,
          },
        )
        .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Category name or slug already exists',
      );
    }

    return this.categories.save(
      this.categories.create({
        name,
        slug,

        imageUrl:
          dto.imageUrl ||
          null,

        description:
          dto.description?.trim() ||
          null,
      }),
    );
  }

  async update(
    id: string,
    dto: CategoryDto,
  ) {
    const category =
      await this.one(id);

    const name =
      dto.name.trim();

    const slug =
      dto.slug
        .trim()
        .toLowerCase();

    const duplicate =
      await this.categories
        .createQueryBuilder(
          'category',
        )
        .where(
          'category.id != :id',
          {
            id,
          },
        )
        .andWhere(
          '(LOWER(category.name) = LOWER(:name) OR category.slug = :slug)',
          {
            name,
            slug,
          },
        )
        .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Category name or slug already exists',
      );
    }

    category.name =
      name;

    category.slug =
      slug;

    category.imageUrl =
      dto.imageUrl ||
      null;

    category.description =
      dto.description?.trim() ||
      null;

    return this.categories.save(
      category,
    );
  }

  async remove(
    id: string,
  ) {
    const category =
      await this.one(id);

    await this.categories.remove(
      category,
    );

    return {
      message:
        'Category deleted successfully',
    };
  }
}
