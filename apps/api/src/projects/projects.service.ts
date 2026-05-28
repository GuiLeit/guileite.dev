import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { PaginateQueryDto } from './dto/paginate-query.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddImageDto } from './dto/add-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';

const PROJECT_INCLUDE = {
  images: { orderBy: { order: 'asc' as const } },
  translations: true,
};

type ProjectWithRelations = Awaited<
  ReturnType<typeof PrismaService.prototype.project.findFirst>
> & {
  images: { id: string; url: string; alt: string | null; order: number }[];
  translations: { locale: string; title: string; description: string }[];
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private flatten(project: ProjectWithRelations, requestedLocale: string) {
    const locale = requestedLocale ?? DEFAULT_LOCALE;
    const translation =
      project.translations.find((t) => t.locale === locale) ??
      project.translations.find((t) => t.locale === DEFAULT_LOCALE);

    return {
      id: project.id,
      title: translation?.title ?? '',
      description: translation?.description ?? '',
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      orderIndex: project.orderIndex,
      resolvedLocale: translation?.locale ?? DEFAULT_LOCALE,
      requestedLocale: locale,
      images: project.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt ?? undefined,
        order: img.order,
      })),
    };
  }

  async findAll(query: PaginateQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;
    const locale = query.locale ?? DEFAULT_LOCALE;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: PROJECT_INCLUDE,
      }),
      this.prisma.project.count(),
    ]);

    return {
      data: items.map((p) => this.flatten(p as ProjectWithRelations, locale)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        locale,
      },
    };
  }

  async findFeatured(locale: string, limit: number) {
    const items = await this.prisma.project.findMany({
      take: limit,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: PROJECT_INCLUDE,
    });
    return items.map((p) => this.flatten(p as ProjectWithRelations, locale));
  }

  async findOne(id: string, locale: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return this.flatten(project as ProjectWithRelations, locale);
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        projectUrl: dto.projectUrl,
        githubUrl: dto.githubUrl,
        orderIndex: dto.orderIndex ?? 0,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            description: t.description,
          })),
        },
        images: dto.images
          ? { create: dto.images.map((img) => ({ url: img.url, alt: img.alt, order: img.order ?? 0 })) }
          : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.assertExists(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.projectUrl !== undefined && { projectUrl: dto.projectUrl }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.project.delete({ where: { id } });
  }

  async upsertTranslation(id: string, locale: string, dto: UpsertTranslationDto) {
    await this.assertExists(id);
    return this.prisma.projectTranslation.upsert({
      where: { projectId_locale: { projectId: id, locale } },
      create: { projectId: id, locale, title: dto.title, description: dto.description },
      update: { title: dto.title, description: dto.description },
    });
  }

  async removeTranslation(id: string, locale: string) {
    if (locale === DEFAULT_LOCALE) {
      throw new BadRequestException(`Cannot delete the default locale translation (${DEFAULT_LOCALE})`);
    }
    await this.assertExists(id);
    await this.prisma.projectTranslation.delete({
      where: { projectId_locale: { projectId: id, locale } },
    });
  }

  async addImage(id: string, dto: AddImageDto) {
    await this.assertExists(id);
    return this.prisma.projectImage.create({
      data: { projectId: id, url: dto.url, alt: dto.alt, order: dto.order ?? 0 },
    });
  }

  async updateImage(id: string, imageId: string, dto: UpdateImageDto) {
    return this.prisma.projectImage.update({
      where: { id: imageId, projectId: id },
      data: {
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.alt !== undefined && { alt: dto.alt }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async removeImage(id: string, imageId: string) {
    await this.prisma.projectImage.delete({ where: { id: imageId, projectId: id } });
  }

  async reorder(dto: ReorderDto) {
    await this.prisma.$transaction(
      dto.items.map(({ id, orderIndex }) =>
        this.prisma.project.update({ where: { id }, data: { orderIndex } }),
      ),
    );
  }

  private async assertExists(id: string) {
    const count = await this.prisma.project.count({ where: { id } });
    if (!count) throw new NotFoundException(`Project ${id} not found`);
  }
}
