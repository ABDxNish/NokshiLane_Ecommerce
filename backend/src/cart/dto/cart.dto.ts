import {
  IsInt,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AddCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}
