import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        config: ConfigService,
      ) => {
        const databaseUrl =
          config.get<string>(
            'DATABASE_URL',
          );

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,

            ssl: {
              rejectUnauthorized: false,
            },

            autoLoadEntities: true,

            synchronize:
              config.get<string>(
                'DB_SYNC',
                'false',
              ) === 'true',
          };
        }

        return {
          type: 'postgres' as const,

          host:
            config.get<string>(
              'DB_HOST',
              'localhost',
            ),

          port:
            Number(
              config.get<string>(
                'DB_PORT',
                '5432',
              ),
            ),

          username:
            config.get<string>(
              'DB_USERNAME',
              'postgres',
            ),

          password:
            config.get<string>(
              'DB_PASSWORD',
              '',
            ),

          database:
            config.get<string>(
              'DB_NAME',
              'nokshilane_ecommerce',
            ),

          autoLoadEntities: true,

          synchronize:
            config.get<string>(
              'DB_SYNC',
              'false',
            ) === 'true',
        };
      },
    }),

    IntegrationsModule,
    PaymentsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
  ],
})
export class AppModule {}
