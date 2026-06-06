import * as xlsx from 'xlsx';
import { BadRequestException } from '@nestjs/common';

export class ExcelUtil {
  static importExcel<T = any>(file: Express.Multer.File): T[] {
    if (!file) {
      throw new BadRequestException('请上传Excel文件');
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持 Excel 格式文件');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet) as T[];

    return data;
  }

  static exportExcel<T = any>(data: T[], sheetName: string = 'Sheet1'): Buffer {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  static generateNo(prefix: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${month}${day}${random}`;
  }
}
