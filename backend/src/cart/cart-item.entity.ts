import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Entity('cart_items')
@Index(
  ['user', 'product'],
  {
    unique: true,
  },
)
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

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
}
