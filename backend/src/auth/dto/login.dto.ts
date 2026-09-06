import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';


export class LoginDto {
  @IsEmail(
    {},
    {
      message:
        'Enter a valid email address',
    },
  )
  @MaxLength(120)
  email: string;


  @IsString()
  @MinLength(
    1,
    {
      message:
        'Password is required',
    },
  )
  password: string;
}