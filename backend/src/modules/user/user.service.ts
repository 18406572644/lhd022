import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { db, User } from '@/common/database/in-memory-db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginationResultDto } from '@/common/dto/pagination.dto';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = db.getUsers().find((u) => u.username === createUserDto.username);

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
    const user = db.addUser(userData);

    return user;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResultDto<User>> {
    const { page = 1, pageSize = 10, keyword, status, startTime, endTime } = paginationDto;

    let data = [...db.getUsers()];

    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.username.toLowerCase().includes(kw) ||
          item.name.toLowerCase().includes(kw) ||
          item.phone.toLowerCase().includes(kw),
      );
    }

    if (status !== undefined) {
      const isActive = status === 'true' || status === '1';
      data = data.filter((item) => item.isActive === isActive);
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
    const list = data.slice(skip, skip + pageSize).map((user) => {
      delete (user as any).password;
      return user;
    });

    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<User> {
    const user = db.getUsers().find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    delete (user as any).password;
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return db.getUsers().find((u) => u.username === username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updated = db.updateUser(id, updateData);
    delete (updated as any).password;
    return updated;
  }

  async remove(id: number): Promise<void> {
    const success = db.deleteUser(id);
    if (!success) {
      throw new NotFoundException('用户不存在');
    }
  }
}
