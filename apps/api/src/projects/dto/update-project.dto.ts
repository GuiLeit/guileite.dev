import { IsInt, IsOptional, IsUrl, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.projectUrl !== null)
  @IsUrl()
  projectUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.githubUrl !== null)
  @IsUrl()
  githubUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}
