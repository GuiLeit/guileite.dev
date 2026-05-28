import {
  Body, Controller, Delete, HttpCode, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';
import { AddImageDto } from './dto/add-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ReorderDto } from './dto/reorder.dto';

@ApiTags('admin')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk reorder projects' })
  reorder(@Body() dto: ReorderDto) {
    return this.projects.reorder(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project language-agnostic fields' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete project (cascades images + translations)' })
  async remove(@Param('id') id: string) {
    await this.projects.remove(id);
  }

  @Put(':id/translations/:locale')
  @ApiOperation({ summary: 'Upsert translation for a locale' })
  upsertTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.projects.upsertTranslation(id, locale, dto);
  }

  @Delete(':id/translations/:locale')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a translation (cannot remove default locale)' })
  async removeTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    await this.projects.removeTranslation(id, locale);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add image to project' })
  addImage(@Param('id') id: string, @Body() dto: AddImageDto) {
    return this.projects.addImage(id, dto);
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Update image metadata' })
  updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateImageDto,
  ) {
    return this.projects.updateImage(id, imageId, dto);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove image' })
  async removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    await this.projects.removeImage(id, imageId);
  }
}
