import { IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpsertTranslationDto } from './upsert-translation.dto';

class InitialTranslationDto extends UpsertTranslationDto {
  @ApiProperty({ example: 'pt-BR' })
  @IsString()
  locale: string;
}

class InitialImageDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  order?: number = 0;
}

export class CreateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  orderIndex?: number = 0;

  @ApiProperty({ type: [InitialTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialTranslationDto)
  translations: InitialTranslationDto[];

  @ApiPropertyOptional({ type: [InitialImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialImageDto)
  images?: InitialImageDto[];
}
