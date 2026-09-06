import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
 @IsString()
@IsNotEmpty()
@MinLength(2)
@MaxLength(60)
@Matches(
  /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u,
  {
    message:
      'Name can contain letters, spaces, apostrophes, dots and hyphens only',
  },
)
name: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @Matches(
    /^(?:\+8801|01)[3-9]\d{8}$/,
    {
      message:
        'Phone must be a valid Bangladeshi mobile number',
    },
  )
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;
}
