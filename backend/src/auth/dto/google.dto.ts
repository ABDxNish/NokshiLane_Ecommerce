import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class GoogleDto {
  @IsString()
  @IsNotEmpty()
  credential: string;
}
