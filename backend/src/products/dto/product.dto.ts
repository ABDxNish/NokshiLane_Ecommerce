import {
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(140)
  @Matches(
    /^[a-z0-9-]+$/,
    {
      message:
        'Slug can contain lowercase letters, numbers and hyphens only',
    },
  )
  slug: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  compareAtPrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @IsUrl({
    require_protocol: true,
  })
  imageUrl: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      each: true,
    },
  )
  images?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  bestseller?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsUUID()
  categoryId: string;
}
