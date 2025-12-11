import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUsersDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
} from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    // Note: If roleId is not provided, we might want to assign a default role.
    // However, for this implementation, we'll assume roleId is handled or optional in DB (it's required in schema though).
    // Let's assume the frontend sends a valid roleId or we fetch a default role here.
    // For now, if roleId is missing, we fail or need a fallback.
    // Let's checking if we need to fetch a default role.

    let roleId = createUserDto.roleId;

    if (!roleId) {
      // Fallback to finding a 'GUEST' role or similar if not provided
      const defaultRole = await this.prisma.role.findUnique({ where: { name: 'GUEST' } });
      if (defaultRole) {
        roleId = defaultRole.id;
      } else {
        // If no role provided and no default found, valid DB constraint might fail.
        // Ideally we should throw if strict.
      }
    }

    if (!roleId) {
      throw new NotFoundException('Role ID is required or default role not found');
    }

    const startData = {
      ...createUserDto,
      password: hashedPassword,
      roleId: roleId
    };

    const { password, ...result } = await this.prisma.user.create({
      data: startData,
    });

    return result;
  }

  async findAll(query: QueryUsersDto) {
    const { search, status, roleId, page = 1, limit = 20 } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          status: true,
          roleId: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    // If password is being updated, hash it
    let dataToUpdate = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists

    // Soft delete by setting status to INACTIVE
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const { password, ...result } = deletedUser;
    return result;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { roleId: dto.roleId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }
}
