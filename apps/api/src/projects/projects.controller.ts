import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { PaginateQueryDto } from './dto/paginate-query.dto';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/locales';

@ApiTags('projects')
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return { status: 'ok' };
  }

  @Get('locales')
  @ApiOperation({ summary: 'Supported locales' })
  locales() {
    return { locales: SUPPORTED_LOCALES, default: DEFAULT_LOCALE };
  }

  @Get('projects')
  @ApiOperation({ summary: 'Paginated project list' })
  findAll(@Query() query: PaginateQueryDto) {
    return this.projects.findAll(query);
  }

  @Get('projects/featured')
  @ApiOperation({ summary: 'Featured projects (top N by orderIndex)' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  @ApiQuery({ name: 'locale', required: false, example: 'pt-BR' })
  findFeatured(
    @Query('locale') locale = DEFAULT_LOCALE,
    @Query('limit') limit = '3',
  ) {
    return this.projects.findFeatured(locale, parseInt(limit, 10));
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Single project with resolved translation' })
  @ApiQuery({ name: 'locale', required: false })
  findOne(
    @Param('id') id: string,
    @Query('locale') locale = DEFAULT_LOCALE,
  ) {
    return this.projects.findOne(id, locale);
  }
}
