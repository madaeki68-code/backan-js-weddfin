import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { PrismaService } from '../../database/prisma.service.js';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'image/svg+xml': 'svg', 'application/pdf': 'pdf',
};
const PUBLIC_FOLDERS = new Set(['assets', 'gallery-images', 'gallery-pdfs', 'portal-assets', 'profile-assets', 'package-covers']);

@Injectable()
export class StorageService {
  private readonly root: string;
  private readonly apiBaseUrl: string;

  constructor(private readonly prisma: PrismaService, config: ConfigService) {
    this.root = resolve(config.get('STORAGE_DIRECTORY') || join(process.cwd(), 'uploads'));
    this.apiBaseUrl = (config.get('PUBLIC_API_URL') || 'http://localhost:4000/api/v1').replace(/\/$/, '');
  }

  async upload(profileId: string, file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, folderValue?: string) {
    if (!file?.buffer?.length) throw new BadRequestException('File wajib dipilih');
    if (file.size > MAX_FILE_BYTES || file.buffer.length > MAX_FILE_BYTES) throw new BadRequestException('Ukuran file maksimal 10 MB');
    const extension = FILE_TYPES[file.mimetype];
    if (!extension) throw new BadRequestException('Jenis file tidak didukung');
    if (!matchesFileType(file.buffer, file.mimetype)) throw new BadRequestException('Isi file tidak cocok dengan jenis yang dikirim');
    const folder = normalizeFolder(folderValue);
    const id = randomUUID();
    const storageKey = `${id}.${extension}`;
    const diskPath = this.filePath(storageKey);
    await mkdir(this.root, { recursive: true });
    await writeFile(diskPath, file.buffer, { flag: 'wx', mode: 0o640 });
    try {
      const asset = await this.prisma.storedAsset.create({ data: {
        id, profileId, storageKey, folder,
        originalName: safeOriginalName(file.originalname), mimeType: file.mimetype,
        sizeBytes: BigInt(file.buffer.length), isPublic: isPublicFolder(folder),
      } });
      return {
        id: asset.id,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        sizeBytes: Number(asset.sizeBytes),
        url: `${this.apiBaseUrl}/${asset.isPublic ? 'storage/public' : 'storage/assets'}/${asset.id}`,
      };
    } catch (error) {
      await rm(diskPath, { force: true });
      throw error;
    }
  }

  async readPublic(id: string) {
    const asset = await this.prisma.storedAsset.findFirst({ where: { id, isPublic: true } });
    if (!asset) throw new NotFoundException('File tidak ditemukan');
    return { asset, buffer: await this.readFromDisk(asset.storageKey) };
  }

  async readPrivate(id: string, profileId: string) {
    const asset = await this.prisma.storedAsset.findFirst({ where: { id, profileId, isPublic: false } });
    if (!asset) throw new NotFoundException('File tidak ditemukan');
    return { asset, buffer: await this.readFromDisk(asset.storageKey) };
  }

  async remove(id: string, profileId: string) {
    const asset = await this.prisma.storedAsset.findFirst({ where: { id, profileId }, select: { id: true, storageKey: true } });
    if (!asset) throw new NotFoundException('File tidak ditemukan');
    await this.prisma.storedAsset.delete({ where: { id } });
    await rm(this.filePath(asset.storageKey), { force: true });
    return { message: 'File berhasil dihapus' };
  }

  private async readFromDisk(storageKey: string) {
    try { return await readFile(this.filePath(storageKey)); }
    catch { throw new NotFoundException('File fisik tidak ditemukan'); }
  }

  private filePath(storageKey: string) {
    const path = resolve(this.root, storageKey);
    const pathFromRoot = relative(this.root, path);
    if (!pathFromRoot || pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) throw new BadRequestException('Path file tidak valid');
    return path;
  }
}

function normalizeFolder(value?: string) {
  const folder = (value || 'assets').trim().replace(/^\/+|\/+$/g, '');
  if (!folder || folder.length > 120 || !/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(folder) || folder.split('/').some(part => part === '.' || part === '..')) {
    throw new BadRequestException('Folder file tidak valid');
  }
  return folder.toLowerCase();
}

function safeOriginalName(value: string) {
  const name = (value || 'upload').replace(/[\r\n\\/\0]/g, '_').trim().slice(0, 255);
  return name || 'upload';
}

function isPublicFolder(folder: string) {
  return PUBLIC_FOLDERS.has(folder) || ['vendor/', 'clients/avatars/', 'team/avatars/'].some(prefix => folder.startsWith(prefix));
}

function matchesFileType(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/gif') return /^GIF8[79]a/.test(buffer.subarray(0, 6).toString('ascii'));
  if (mimeType === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (mimeType === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (mimeType === 'image/svg+xml') return /<svg\b/i.test(buffer.subarray(0, 8192).toString('utf8').replace(/^\uFEFF/, ''));
  return false;
}
