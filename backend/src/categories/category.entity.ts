import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 60,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 70,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;
}