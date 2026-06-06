import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传图片');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持 JPG、PNG、GIF、WEBP 格式的图片');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      url: `${baseUrl}/uploads/images/${fileName}`,
      name: fileName,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请上传图片');
    }

    const results = [];
    for (const file of files) {
      const result = await this.uploadImage(file);
      results.push(result);
    }

    return {
      total: results.length,
      list: results,
    };
  }
}
