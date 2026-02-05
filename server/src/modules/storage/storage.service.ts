/**
 * 对象存储服务（当前实现：本地存储）
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { AppLoggerService } from '../../shared/logger/logger.service';
import { Client as MinioClient } from 'minio';

export interface StoredObject {
  url: string;
  path: string;
}

@Injectable()
export class StorageService {
  private storageType: string;
  private readonly localDir: string;
  private readonly publicUrl?: string;
  private readonly minio?: {
    client: MinioClient;
    bucket: string;
    useSSL: boolean;
    endPoint: string;
    port?: number;
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE') || 'local';
    this.localDir =
      this.configService.get<string>('STORAGE_LOCAL_DIR') || join(process.cwd(), 'uploads');
    this.publicUrl = this.configService.get<string>('STORAGE_PUBLIC_URL');

    if (this.storageType === 'minio') {
      const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
      const port = this.configService.get<number>('MINIO_PORT');
      const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
      const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
      const bucket = this.configService.get<string>('MINIO_BUCKET') || 'images';
      const useSSL = this.configService.get<boolean>('MINIO_USE_SSL') || false;

      if (endPoint && accessKey && secretKey) {
        this.minio = {
          client: new MinioClient({
            endPoint,
            port,
            useSSL,
            accessKey,
            secretKey,
          }),
          bucket,
          useSSL,
          endPoint,
          port,
        };
      } else {
        this.logger.warn('MinIO 配置不完整，回退到本地存储', 'StorageService');
        this.storageType = 'local';
      }
    }
  }

  /**
   * 上传图片
   */
  async upload(buffer: Buffer, userId: number, contentType = 'image/png'): Promise<StoredObject> {
    const ext = this.getExtension(contentType);
    const fileName = `${userId}/${Date.now()}_${this.randomId()}${ext}`;
    const filePath = join(this.localDir, fileName);

    if (this.storageType === 'minio' && this.minio) {
      return this.uploadToMinio(fileName, buffer, contentType);
    }

    await this.ensureDir(filePath);
    await fs.writeFile(filePath, buffer);

    return {
      url: this.buildPublicUrl(fileName),
      path: filePath,
    };
  }

  /**
   * 上传缩略图（当前与原图一致，后续可接入图像压缩）
   */
  async uploadThumbnail(
    buffer: Buffer,
    userId: number,
    contentType = 'image/png',
  ): Promise<StoredObject> {
    const ext = this.getExtension(contentType);
    const fileName = `${userId}/thumb_${Date.now()}_${this.randomId()}${ext}`;
    const filePath = join(this.localDir, fileName);

    if (this.storageType === 'minio' && this.minio) {
      return this.uploadToMinio(fileName, buffer, contentType);
    }

    await this.ensureDir(filePath);
    await fs.writeFile(filePath, buffer);

    return {
      url: this.buildPublicUrl(fileName),
      path: filePath,
    };
  }

  private getExtension(contentType: string): string {
    const mapping: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return mapping[contentType] || '.png';
  }

  private buildPublicUrl(relativePath: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, '')}/${relativePath}`;
    }
    if (this.storageType === 'minio' && this.minio) {
      const protocol = this.minio.useSSL ? 'https' : 'http';
      const host = this.minio.port ? `${this.minio.endPoint}:${this.minio.port}` : this.minio.endPoint;
      return `${protocol}://${host}/${this.minio.bucket}/${relativePath}`;
    }
    return `/uploads/${relativePath}`;
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  private async uploadToMinio(
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<StoredObject> {
    if (!this.minio) {
      throw new Error('MinIO client 未初始化');
    }

    const { client, bucket } = this.minio;

    const exists = await client.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await client.makeBucket(bucket, 'us-east-1');
    }

    await client.putObject(bucket, objectName, buffer, {
      'Content-Type': contentType,
    });

    return {
      url: this.buildPublicUrl(objectName),
      path: `${bucket}/${objectName}`,
    };
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}
