import { FindOptionsWhere, Like, Between, Repository } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export class QueryUtil {
  static buildWhere<T>(
    paginationDto: PaginationDto,
    searchFields: (keyof T)[],
    dateField: keyof T = 'createdAt' as keyof T,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const { keyword, regionId, status, startTime, endTime } = paginationDto;

    if (keyword && searchFields.length > 0) {
      const orConditions: FindOptionsWhere<T>[] = searchFields.map((field) => {
        const condition: any = { [field]: Like(`%${keyword}%`) };
        if (regionId) condition.regionId = regionId;
        if (status) condition.status = status;
        if (startTime && endTime) {
          condition[dateField] = Between(new Date(startTime), new Date(endTime));
        } else if (startTime) {
          condition[dateField] = Between(new Date(startTime), new Date());
        } else if (endTime) {
          condition[dateField] = Between(new Date('1970-01-01'), new Date(endTime));
        }
        return condition as FindOptionsWhere<T>;
      });
      return orConditions;
    }

    const where: FindOptionsWhere<T> = {} as FindOptionsWhere<T>;

    if (regionId) {
      (where as any).regionId = regionId;
    }

    if (status) {
      (where as any).status = status;
    }

    if (startTime && endTime) {
      (where as any)[dateField] = Between(new Date(startTime), new Date(endTime));
    } else if (startTime) {
      (where as any)[dateField] = Between(new Date(startTime), new Date());
    } else if (endTime) {
      (where as any)[dateField] = Between(new Date('1970-01-01'), new Date(endTime));
    }

    return where;
  }

  static async findWithPagination<T>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    searchFields: (keyof T)[],
    dateField: keyof T = 'createdAt' as keyof T,
    relations?: string[],
  ) {
    const { page, pageSize } = paginationDto;
    const where = this.buildWhere(paginationDto, searchFields, dateField);

    const findOptions: any = {
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { [dateField]: 'DESC' } as any,
    };

    if (relations && relations.length > 0) {
      findOptions.relations = relations;
    }

    const [list, total] = await repository.findAndCount(findOptions);
    return { list, total, page, pageSize };
  }
}
