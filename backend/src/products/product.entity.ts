import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  Category,
} from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 120,
  })
  name: string;

  @Column({
    unique: true,
    length: 140,
  })
  slug: string;

  @Column({
    unique: true,
    length: 50,
  })
  sku: string;

 @Column({
  type: 'varchar',
  length: 60,
  nullable: true,
})
brand: string | null;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  compareAtPrice:
    number | null;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column()
  imageUrl: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  images: string[];

  @Column({
    default: false,
  })
  featured: boolean;

  @Column({
    default: false,
  })
  bestseller: boolean;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 4.5,
  })
  rating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  reviewCount: number;

  @ManyToOne(
    () => Category,
    {
      eager: true,
      onDelete: 'RESTRICT',
    },
  )
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
