import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';
import { QueryUtil } from '@/common/utils/query.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const userData = {
      username: createUserDto.username,
      name: createUserDto.name,
      role: createUserDto.role,
      password: hashedPassword,
      phone: createUserDto.phone || '',
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    };
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<User>> {
    const { status } = paginationDto;

    const result = await QueryUtil.findWithPagination<User>(
      this.userRepository,
      paginationDto,
      ['username', 'name', 'phone'],
    );

    if (status !== undefined) {
      const isActive = status === 'true' || status === '1';
      const where = result.list[0] ? { ...(result.list[0] as any) } : {};
      const filteredList = result.list.filter((item) => item.isActive === isActive);
      const filteredTotal = filteredList.length;
      return {
        list: filteredList.map((user) => {
          delete (user as any).password;
          return user;
        }),
        total: filteredTotal,
        page: paginationDto.page,
        pageSize: paginationDto.pageSize,
      };
    }

    return {
      list: result.list.map((user) => {
        delete (user as any).password;
        return user;
      }),
      total: result.total,
      page: paginationDto.page,
      pageSize: paginationDto.pageSize,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    delete (user as any).password;
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    await this.userRepository.update(id, updateData);
    const updated = await this.userRepository.findOne({ where: { id } });
    delete (updated as any).password;
    return updated!;
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('用户不存在');
    }
  }
}
