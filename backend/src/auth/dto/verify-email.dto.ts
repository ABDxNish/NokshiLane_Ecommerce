import {
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';


export class VerifyEmailDto {
  @IsEmail(
    {},
    {
      message:
        'Enter a valid email address',
    },
  )
  @MaxLength(120)
  email: string;


  @Matches(
    /^\d{6}$/,
    {
      message:
        'Verification code must contain exactly 6 digits',
    },
  )
  code: string;
}