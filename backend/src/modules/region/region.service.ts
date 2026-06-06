import { Injectable, NotFoundException } from '@nestjs/common';
import { db, Region } from '@/common/database/in-memory-db';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';

@Injectable()
export class RegionService {
  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    return db.addRegion({
      ...createRegionDto,
      parentId: createRegionDto.parentId || 0,
      level: createRegionDto.level || 1,
      sort: createRegionDto.sort || 0,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Region>> {
    const { page = 1, pageSize = 10, keyword, startTime, endTime } = paginationDto;

    let data = [...db.getRegions()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter((item) => item.name.toLowerCase().includes(kw));
    }

    if (startTime) {
      const start = new Date(startTime);
      data = data.filter((item) => new Date(item.createdAt) >= start);
    }

    if (endTime) {
      const end = new Date(endTime);
      end.setHours(23, 59, 59, 999);
      data = data.filter((item) => new Date(item.createdAt) <= end);
    }

    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = data.length;
    const skip = (page - 1) * pageSize;
    const list = data.slice(skip, skip + pageSize);

    return { list, total, page, pageSize };
  }

  async findTree(): Promise<Region[]> {
    const regions = [...db.getRegions()].sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return this.buildTree(regions);
  }

  private buildTree(regions: Region[], parentId: number = 0): Region[] {
    const tree: Region[] = [];
    for (const region of regions) {
      if (region.parentId === parentId) {
        const children = this.buildTree(regions, region.id);
        if (children.length > 0) {
          (region as any).children = children;
        }
        tree.push(region);
      }
    }
    return tree;
  }

  async findOne(id: number): Promise<Region> {
    const region = db.getRegions().find((r) => r.id === id);
    if (!region) {
      throw new NotFoundException('区域不存在');
    }
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);
    const updated = db.updateRegion(id, updateRegionDto);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const success = db.deleteRegion(id);
    if (!success) {
      throw new NotFoundException('区域不存在');
    }
  }
}
