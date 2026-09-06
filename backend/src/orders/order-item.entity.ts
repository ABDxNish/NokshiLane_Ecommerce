import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Order,
} from './order.entity';


@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column('uuid')
  productId: string;


  @Column({
    length: 120,
  })
  productName: string;


  @Column({
    length: 50,
  })
  sku: string;


  @Column()
  imageUrl: string;


  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;


  @Column({
    type: 'int',
  })
  quantity: number;


  @ManyToOne(
    () => Order,
    (order) => order.items,
    {
      onDelete: 'CASCADE',
    },
  )
  order: Order;
}
