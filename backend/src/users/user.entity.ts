import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  UserRole,
} from '../auth/auth.types';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;


  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
  })
  email: string;


  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  phone: string | null;


  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  password: string | null;


  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  googleId: string | null;


  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;


  /*
   * Keep true as the DB default so
   * accounts created before OTP support
   * remain usable.
   *
   * New normal registrations explicitly
   * set this to false.
   */
  @Column({
    type: 'boolean',
    default: true,
  })
  emailVerified: boolean;


  /*
   * Never store the OTP itself.
   * Store only its bcrypt hash.
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  emailVerificationCodeHash:
    string | null;


  @Column({
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationExpiresAt:
    Date | null;


  @Column({
    type: 'integer',
    default: 0,
  })
  emailVerificationAttempts:
    number;


  @Column({
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationLastSentAt:
    Date | null;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;
}