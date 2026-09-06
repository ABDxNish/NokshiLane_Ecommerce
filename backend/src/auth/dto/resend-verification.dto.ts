import {
  IsEmail,
  MaxLength,
} from 'class-validator';


export class ResendVerificationDto {
  @IsEmail(
    {},
    {
      message:
        'Enter a valid email address',
    },
  )
  @MaxLength(120)
  email: string;
}