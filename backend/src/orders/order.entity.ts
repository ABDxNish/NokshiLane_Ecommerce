import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  User,
} from '../users/user.entity';

import {
  OrderItem,
} from './order-item.entity';


export enum PaymentMethod {
  COD = 'COD',
  SSLCOMMERZ = 'SSLCOMMERZ',
}


export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}


export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
    length: 30,
  })
  orderNumber: string;


 @Column({
  type: 'varchar',
  unique: true,
  nullable: true,
  length: 40,
})
transactionId: string | null;


  @Column({
    length: 70,
  })
  recipientName: string;


  @Column({
    length: 20,
  })
  phone: string;


  @Column({
    type: 'text',
  })
  address: string;


  @Column({
    length: 60,
  })
  city: string;


  @Column({
    length: 80,
  })
  area: string;


  @Column({
  type: 'varchar',
  nullable: true,
  length: 20,
})
postcode: string | null;


  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  subtotal: number;


  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  shippingFee: number;


  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  total: number;


  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod:
    PaymentMethod;


  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  paymentStatus:
    PaymentStatus;


  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status:
    OrderStatus;


  @Column({
    default: false,
  })
  stockRestored: boolean;


  @ManyToOne(
    () => User,
    {
      eager: true,
      onDelete: 'RESTRICT',
    },
  )
  user: User;


  @OneToMany(
    () => OrderItem,
    (item) => item.order,
    {
      eager: true,
      cascade: true,
    },
  )
  items: OrderItem[];


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;
}
