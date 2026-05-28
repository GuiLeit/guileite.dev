import { IsInt, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  projectUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}
