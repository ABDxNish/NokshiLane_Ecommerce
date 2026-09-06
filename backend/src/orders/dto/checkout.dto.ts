import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  PaymentMethod,
} from '../order.entity';


export class CheckoutDto {
  @IsString()
@IsNotEmpty()
@MinLength(2)
@MaxLength(60)
@Matches(
  /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u,
  {
    message:
      'Recipient name can contain letters, spaces, dots, apostrophes and hyphens only',
  },
)
recipientName: string;


  @Matches(
    /^(?:\+8801|01)[3-9]\d{8}$/,
    {
      message:
        'Enter a valid Bangladeshi mobile number',
    },
  )
  phone: string;


  @IsString()
  @MinLength(8)
  @MaxLength(200)
  address: string;


  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city: string;


  @IsString()
  @MinLength(2)
  @MaxLength(80)
  area: string;


  @ValidateIf(
  (_, value) =>
    value !== undefined &&
    value !== null &&
    value !== '',
)
@IsString()
@Matches(
  /^\d{4}$/,
  {
    message:
      'Postcode must contain exactly 4 digits',
  },
)
postcode?: string;


  @IsEnum(PaymentMethod)
  paymentMethod:
    PaymentMethod;
}
