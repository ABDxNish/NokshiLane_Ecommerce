import 'reflect-metadata';

import {
  ConfigService,
} from '@nestjs/config';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DataSource,
} from 'typeorm';

import bcrypt = require('bcrypt');

import {
  AppModule,
} from './app.module';

import {
  UserRole,
} from './auth/auth.types';

import {
  Category,
} from './categories/category.entity';

import {
  Product,
} from './products/product.entity';

import {
  User,
} from './users/user.entity';


const image = (
  id: string,
  width = 1200,
) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;


async function seedAdmin(
  dataSource: DataSource,
  config: ConfigService,
) {
  const users =
    dataSource.getRepository(
      User,
    );


  const email =
    (
      config.get<string>(
        'SEED_ADMIN_EMAIL',
      ) ||
      'admin@nokshilane.local'
    )
      .trim()
      .toLowerCase();


  const existing =
    await users.findOne({
      where: {
        email,
      },
    });


  if (existing) {
    console.log(
      `Admin already exists: ${email}`,
    );

    return;
  }


  const password =
    config.get<string>(
      'SEED_ADMIN_PASSWORD',
    ) ||
    'Admin123!';


  const hashed =
    await bcrypt.hash(
      password,
      12,
    );


  await users.save(
    users.create({
      name:
        config.get<string>(
          'SEED_ADMIN_NAME',
        ) ||
        'NokshiLane Admin',

      email,

      phone: null,

      password:
        hashed,

      googleId:
        null,

      role:
        UserRole.ADMIN,
    }),
  );


  console.log(
    `Admin created: ${email}`,
  );
}


async function seedCategories(
  dataSource: DataSource,
) {
  const categories =
    dataSource.getRepository(
      Category,
    );


  const data = [
    {
      name:
        'Women',

      slug:
        'women',

      description:
        'Modern silhouettes, dresses, tops and everyday womenswear.',

      imageUrl:
        image(
          'photo-1490481651871-ab68de25d43d',
        ),
    },

    {
      name:
        'Men',

      slug:
        'men',

      description:
        'Clean menswear for work, weekends and everyday styling.',

      imageUrl:
        image(
          'photo-1521572163474-6864f9cf17ab',
        ),
    },

    {
      name:
        'Footwear',

      slug:
        'footwear',

      description:
        'Sneakers, sandals and everyday footwear designed for comfort.',

      imageUrl:
        image(
          'photo-1542291026-7eec264c27ff',
        ),
    },

    {
      name:
        'Accessories',

      slug:
        'accessories',

      description:
        'Bags, watches and finishing touches for your everyday look.',

      imageUrl:
        image(
          'photo-1523275335684-37898b6baf30',
        ),
    },
  ];


  for (
    const row
    of data
  ) {
    let category =
      await categories
        .findOne({
          where: {
            slug:
              row.slug,
          },
        });


    if (!category) {
      category =
        categories.create(
          row,
        );

      await categories.save(
        category,
      );

      console.log(
        `Category created: ${row.name}`,
      );
    }
  }
}


async function seedProducts(
  dataSource: DataSource,
) {
  const categories =
    dataSource.getRepository(
      Category,
    );

  const products =
    dataSource.getRepository(
      Product,
    );


  const allCategories =
    await categories.find();


  const categoryMap =
    new Map(
      allCategories.map(
        (category) => [
          category.slug,
          category,
        ],
      ),
    );


  const women =
    categoryMap.get(
      'women',
    );

  const men =
    categoryMap.get(
      'men',
    );

  const footwear =
    categoryMap.get(
      'footwear',
    );

  const accessories =
    categoryMap.get(
      'accessories',
    );


  if (
    !women ||
    !men ||
    !footwear ||
    !accessories
  ) {
    throw new Error(
      'Required categories were not created',
    );
  }


  const data:
    Array<
      Partial<Product> & {
        category:
          Category;
      }
    > = [

    // ========================================================
    // WOMEN
    // ========================================================

    {
      name:
        'Midnight Flow Dress',

      slug:
        'midnight-flow-dress',

      sku:
        'NK-W-001',

      brand:
        'NokshiLane',

      description:
        'A fluid evening dress with a modern silhouette, soft drape and comfortable lining. Designed for dinners, events and elevated everyday styling.',

      price:
        3890,

      compareAtPrice:
        4490,

      stock:
        18,

      imageUrl:
        image(
          'photo-1595777457583-95e059d581b8',
        ),

      images: [
        image(
          'photo-1595777457583-95e059d581b8',
        ),

        image(
          'photo-1515886657613-9f3515b0c78f',
        ),

        image(
          'photo-1529139574466-a303027c1d8b',
        ),
      ],

      featured:
        true,

      bestseller:
        true,

      rating:
        4.8,

      reviewCount:
        126,

      category:
        women,
    },

    {
      name:
        'Ivory City Top',

      slug:
        'ivory-city-top',

      sku:
        'NK-W-002',

      brand:
        'NokshiLane',

      description:
        'A minimal everyday top with a clean neckline and comfortable lightweight construction, made for effortless office and casual styling.',

      price:
        1890,

      compareAtPrice:
        2190,

      stock:
        30,

      imageUrl:
        image(
          'photo-1490481651871-ab68de25d43d',
        ),

      images: [
        image(
          'photo-1490481651871-ab68de25d43d',
        ),

        image(
          'photo-1483985988355-763728e1935b',
        ),
      ],

      featured:
        true,

      bestseller:
        false,

      rating:
        4.6,

      reviewCount:
        78,

      category:
        women,
    },

    {
      name:
        'Studio Layer Jacket',

      slug:
        'studio-layer-jacket',

      sku:
        'NK-W-003',

      brand:
        'NokshiLane',

      description:
        'A structured layering piece designed for smart everyday dressing, transitional weather and effortless styling over simple basics.',

      price:
        4490,

      compareAtPrice:
        4990,

      stock:
        12,

      imageUrl:
        image(
          'photo-1529139574466-a303027c1d8b',
        ),

      images: [
        image(
          'photo-1529139574466-a303027c1d8b',
        ),

        image(
          'photo-1515886657613-9f3515b0c78f',
        ),
      ],

      featured:
        false,

      bestseller:
        true,

      rating:
        4.7,

      reviewCount:
        55,

      category:
        women,
    },


    // ========================================================
    // MEN
    // ========================================================

    {
      name:
        'Essential Cotton Tee',

      slug:
        'essential-cotton-tee',

      sku:
        'NK-M-001',

      brand:
        'NokshiLane',

      description:
        'A premium everyday cotton tee with a relaxed silhouette, durable neckline and breathable fabric suited for Bangladesh weather.',

      price:
        1290,

      compareAtPrice:
        1490,

      stock:
        50,

      imageUrl:
        image(
          'photo-1521572163474-6864f9cf17ab',
        ),

      images: [
        image(
          'photo-1521572163474-6864f9cf17ab',
        ),

        image(
          'photo-1506629082955-511b1aa562c8',
        ),
      ],

      featured:
        true,

      bestseller:
        true,

      rating:
        4.7,

      reviewCount:
        212,

      category:
        men,
    },

    {
      name:
        'Urban Overshirt',

      slug:
        'urban-overshirt',

      sku:
        'NK-M-002',

      brand:
        'NokshiLane',

      description:
        'A versatile overshirt with a clean modern shape designed for layering over tees and shirts throughout changing seasons.',

      price:
        2790,

      compareAtPrice:
        3190,

      stock:
        24,

      imageUrl:
        image(
          'photo-1506629082955-511b1aa562c8',
        ),

      images: [
        image(
          'photo-1506629082955-511b1aa562c8',
        ),

        image(
          'photo-1521572163474-6864f9cf17ab',
        ),
      ],

      featured:
        false,

      bestseller:
        true,

      rating:
        4.5,

      reviewCount:
        91,

      category:
        men,
    },

    {
      name:
        'Weekend Knit',

      slug:
        'weekend-knit',

      sku:
        'NK-M-003',

      brand:
        'NokshiLane',

      description:
        'Soft comfortable knitwear for cooler evenings and air-conditioned spaces, with an easy fit made for casual weekend styling.',

      price:
        2490,

      compareAtPrice:
        null,

      stock:
        17,

      imageUrl:
        image(
          'photo-1445205170230-053b83016050',
        ),

      images: [
        image(
          'photo-1445205170230-053b83016050',
        ),
      ],

      featured:
        true,

      bestseller:
        false,

      rating:
        4.4,

      reviewCount:
        42,

      category:
        men,
    },


    // ========================================================
    // FOOTWEAR
    // ========================================================

    {
      name:
        'Pulse Runner',

      slug:
        'pulse-runner',

      sku:
        'NK-F-001',

      brand:
        'NokshiLane',

      description:
        'Lightweight everyday sneakers with cushioned support, breathable construction and a bold contemporary profile.',

      price:
        3690,

      compareAtPrice:
        4190,

      stock:
        21,

      imageUrl:
        image(
          'photo-1542291026-7eec264c27ff',
        ),

      images: [
        image(
          'photo-1542291026-7eec264c27ff',
        ),
      ],

      featured:
        true,

      bestseller:
        true,

      rating:
        4.9,

      reviewCount:
        188,

      category:
        footwear,
    },

    {
      name:
        'Street Court Sneaker',

      slug:
        'street-court-sneaker',

      sku:
        'NK-F-002',

      brand:
        'NokshiLane',

      description:
        'A versatile low-profile sneaker combining everyday comfort with minimal styling for casual outfits and daily commuting.',

      price:
        3290,

      compareAtPrice:
        3590,

      stock:
        27,

      imageUrl:
        image(
          'photo-1543508282-6319a3e2621f',
        ),

      images: [
        image(
          'photo-1543508282-6319a3e2621f',
        ),

        image(
          'photo-1460353581641-37baddab0fa2',
        ),
      ],

      featured:
        true,

      bestseller:
        false,

      rating:
        4.6,

      reviewCount:
        74,

      category:
        footwear,
    },

    {
      name:
        'Everyday Leather Step',

      slug:
        'everyday-leather-step',

      sku:
        'NK-F-003',

      brand:
        'NokshiLane',

      description:
        'A refined everyday shoe with a clean upper, comfortable footbed and styling suited for both casual and semi-formal outfits.',

      price:
        3990,

      compareAtPrice:
        null,

      stock:
        15,

      imageUrl:
        image(
          'photo-1549298916-b41d501d3772',
        ),

      images: [
        image(
          'photo-1549298916-b41d501d3772',
        ),
      ],

      featured:
        false,

      bestseller:
        true,

      rating:
        4.7,

      reviewCount:
        63,

      category:
        footwear,
    },


    // ========================================================
    // ACCESSORIES
    // ========================================================

    {
      name:
        'Classic Steel Watch',

      slug:
        'classic-steel-watch',

      sku:
        'NK-A-001',

      brand:
        'NokshiLane',

      description:
        'A minimal stainless-steel watch with a clean dial and versatile design suitable for workdays, dinners and formal occasions.',

      price:
        4990,

      compareAtPrice:
        5490,

      stock:
        14,

      imageUrl:
        image(
          'photo-1523275335684-37898b6baf30',
        ),

      images: [
        image(
          'photo-1523275335684-37898b6baf30',
        ),
      ],

      featured:
        true,

      bestseller:
        true,

      rating:
        4.8,

      reviewCount:
        101,

      category:
        accessories,
    },

    {
      name:
        'Sculpt Carry Bag',

      slug:
        'sculpt-carry-bag',

      sku:
        'NK-A-002',

      brand:
        'NokshiLane',

      description:
        'A structured everyday carry bag with refined proportions, practical storage and a clean minimalist finish.',

      price:
        3290,

      compareAtPrice:
        3690,

      stock:
        20,

      imageUrl:
        image(
          'photo-1584917865442-de89df76afd3',
        ),

      images: [
        image(
          'photo-1584917865442-de89df76afd3',
        ),
      ],

      featured:
        true,

      bestseller:
        false,

      rating:
        4.6,

      reviewCount:
        67,

      category:
        accessories,
    },

    {
      name:
        'Minimal Day Pack',

      slug:
        'minimal-day-pack',

      sku:
        'NK-A-003',

      brand:
        'NokshiLane',

      description:
        'A compact lifestyle bag designed for everyday essentials with clean lines, practical organization and comfortable carrying.',

      price:
        2890,

      compareAtPrice:
        null,

      stock:
        25,

      imageUrl:
        image(
          'photo-1553062407-98eeb64c6a62',
        ),

      images: [
        image(
          'photo-1553062407-98eeb64c6a62',
        ),
      ],

      featured:
        false,

      bestseller:
        true,

      rating:
        4.5,

      reviewCount:
        84,

      category:
        accessories,
    },
  ];


  for (
    const row
    of data
  ) {
    const existing =
      await products
        .findOne({
          where: {
            sku:
              row.sku!,
          },
        });


    if (existing) {
      console.log(
        `Product already exists: ${row.sku}`,
      );

      continue;
    }


    await products.save(
      products.create(
        row,
      ),
    );


    console.log(
      `Product created: ${row.name}`,
    );
  }
}


async function seed() {
  console.log(
    '------------------------------------------',
  );

  console.log(
    'Starting NokshiLane database seed...',
  );

  console.log(
    '------------------------------------------',
  );


  const app =
    await NestFactory
      .createApplicationContext(
        AppModule,
      );


  try {
    const dataSource =
      app.get(
        DataSource,
      );

    const config =
      app.get(
        ConfigService,
      );


    await seedAdmin(
      dataSource,
      config,
    );


    await seedCategories(
      dataSource,
    );


    await seedProducts(
      dataSource,
    );


    console.log('');
    console.log(
      '==========================================',
    );

    console.log(
      'NokshiLane seed completed successfully.',
    );

    console.log(
      '==========================================',
    );

    console.log('');
    console.log(
      'Default admin:',
    );

    console.log(
      config.get<string>(
        'SEED_ADMIN_EMAIL',
      ) ||
      'admin@nokshilane.local',
    );

    console.log(
      'Password:',
    );

    console.log(
      config.get<string>(
        'SEED_ADMIN_PASSWORD',
      ) ||
      'Admin123!',
    );

    console.log('');
  } finally {
    await app.close();
  }
}


seed().catch(
  (error) => {
    console.error(
      'Seed failed:',
      error,
    );

    process.exit(1);
  },
);
