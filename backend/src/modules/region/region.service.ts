import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '@/entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region) private regionRepository: Repository<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const regionData = {
      ...createRegionDto,
      parentId: createRegionDto.parentId || 0,
      level: createRegionDto.level || 1,
      sort: createRegionDto.sort || 0,
    };
    const region = this.regionRepository.create(regionData);
    return this.regionRepository.save(region);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<Region>> {
    return QueryUtil.findWithPagination<Region>(
      this.regionRepository,
      paginationDto,
      ['name'],
    );
  }

  async findTree(): Promise<Region[]> {
    const regions = await this.regionRepository.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
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
    const region = await this.regionRepository.findOne({ where: { id } });
    if (!region) {
      throw new NotFoundException('区域不存在');
    }
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);
    await this.regionRepository.update(id, updateRegionDto);
    return this.regionRepository.findOne({ where: { id } }) as Promise<Region>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.regionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('区域不存在');
    }
  }
}
