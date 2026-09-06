import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(70)
  @Matches(
    /^[a-z0-9-]+$/,
    {
      message:
        'Slug can contain lowercase letters, numbers and hyphens only',
    },
  )
  slug: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
