import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Product,
} from '../products/product.entity';

import {
  User,
} from '../users/user.entity';

@Entity('wishlist_items')
@Index(
  ['user', 'product'],
  {
    unique: true,
  },
)
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE',
    },
  )
  user: User;

  @ManyToOne(
    () => Product,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
