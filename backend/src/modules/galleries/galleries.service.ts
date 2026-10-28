import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateGalleryDto } from './dto/create-gallery.dto.js';
import { UpdateGalleryDto } from './dto/update-gallery.dto.js';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto.js';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto.js';

@Injectable()
export class GalleriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(profileId: string) {
    return this.prisma.gallery.findMany({ where: { project: { profileId, deletedAt: null } }, include: { items: { orderBy: { sortOrder: 'asc' } }, project: { select: { id: true, title: true, eventDate: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async create(profileId: string, dto: CreateGalleryDto) {
    await this.requireProject(profileId, dto.projectId);
    return this.prisma.gallery.create({ data: {
      projectId: dto.projectId, slug: dto.slug.trim(), accessCode: dto.accessCode,
      coverImageUrl: dto.coverImageUrl, isPublished: dto.isPublished ?? false, downloadAllowed: dto.downloadAllowed ?? true,
    } });
  }

  async update(id: string, profileId: string, dto: UpdateGalleryDto) {
    await this.requireGallery(id, profileId);
    if (dto.projectId) await this.requireProject(profileId, dto.projectId);
    return this.prisma.gallery.update({ where: { id }, data: {
      ...(dto.projectId !== undefined && { projectId: dto.projectId }), ...(dto.slug !== undefined && { slug: dto.slug.trim() }),
      ...(dto.accessCode !== undefined && { accessCode: dto.accessCode }), ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
      ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }), ...(dto.downloadAllowed !== undefined && { downloadAllowed: dto.downloadAllowed }),
    } });
  }

  async remove(id: string, profileId: string) {
    await this.requireGallery(id, profileId);
    await this.prisma.gallery.delete({ where: { id } });
    return { message: 'Gallery berhasil dihapus' };
  }

  async createItem(profileId: string, dto: CreateGalleryItemDto) {
    await this.requireGallery(dto.galleryId, profileId);
    return this.prisma.galleryItem.create({ data: {
      galleryId: dto.galleryId, fileName: dto.fileName, filePath: dto.filePath, thumbnailPath: dto.thumbnailPath,
      fileSizeBytes: dto.fileSizeBytes === undefined ? undefined : BigInt(dto.fileSizeBytes), mimeType: dto.mimeType,
      category: dto.category ?? 'Highlights', sortOrder: dto.sortOrder ?? 0, isClientFavorite: dto.isClientFavorite ?? false,
    } });
  }

  async updateItem(id: string, profileId: string, dto: UpdateGalleryItemDto) {
    await this.requireItem(id, profileId);
    if (dto.galleryId) await this.requireGallery(dto.galleryId, profileId);
    return this.prisma.galleryItem.update({ where: { id }, data: {
      ...(dto.galleryId !== undefined && { galleryId: dto.galleryId }), ...(dto.fileName !== undefined && { fileName: dto.fileName }),
      ...(dto.filePath !== undefined && { filePath: dto.filePath }), ...(dto.thumbnailPath !== undefined && { thumbnailPath: dto.thumbnailPath }),
      ...(dto.fileSizeBytes !== undefined && { fileSizeBytes: BigInt(dto.fileSizeBytes) }), ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
      ...(dto.category !== undefined && { category: dto.category }), ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.isClientFavorite !== undefined && { isClientFavorite: dto.isClientFavorite }),
    } });
  }

  async removeItem(id: string, profileId: string) {
    await this.requireItem(id, profileId);
    await this.prisma.galleryItem.delete({ where: { id } });
    return { message: 'Foto gallery berhasil dihapus' };
  }

  async findPublic(slug: string, accessCode?: string) {
    const gallery = await this.prisma.gallery.findFirst({
      where: { slug, isPublished: true, project: { deletedAt: null } },
      include: { items: { orderBy: { sortOrder: 'asc' } }, project: { select: { title: true, eventDate: true } } },
    });
    if (!gallery) throw new NotFoundException('Gallery tidak ditemukan');
    if (gallery.accessCode && gallery.accessCode !== accessCode) throw new ForbiddenException('Kode akses gallery tidak sesuai');
    await this.prisma.gallery.update({ where: { id: gallery.id }, data: { viewsCount: { increment: 1 } } });
    const { accessCode: _accessCode, ...publicGallery } = gallery;
    return publicGallery;
  }

  private async requireProject(profileId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, profileId, deletedAt: null }, select: { id: true } });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan');
    return project;
  }
  private async requireGallery(id: string, profileId: string) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id, project: { profileId } }, select: { id: true } });
    if (!gallery) throw new NotFoundException('Gallery tidak ditemukan');
    return gallery;
  }
  private async requireItem(id: string, profileId: string) {
    const item = await this.prisma.galleryItem.findFirst({ where: { id, gallery: { project: { profileId } } }, select: { id: true } });
    if (!item) throw new NotFoundException('Foto gallery tidak ditemukan');
    return item;
  }
}
