import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
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

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        status: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    // Hard delete as per standard CRUD, or soft delete implemented via logic.
    // Schema doesn't enforce soft delete but has Status.
    // Let's do hard delete for now as requested "CRUD".
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
