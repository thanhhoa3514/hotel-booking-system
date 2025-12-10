import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) { }

  async create(createRoomDto: CreateRoomDto) {
    // Check room number uniqueness
    const existingRoom = await this.prisma.room.findUnique({
      where: { roomNumber: createRoomDto.roomNumber },
    });
    if (existingRoom) {
      throw new ConflictException(`Room number ${createRoomDto.roomNumber} already exists`);
    }

    // Check typeId existence
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: createRoomDto.typeId },
    });
    if (!roomType) {
      throw new BadRequestException('Invalid Room Type ID');
    }

    return this.prisma.room.create({
      data: createRoomDto,
      include: {
        roomType: true,
      },
    });
  }

  async findAll() {
    return this.prisma.room.findMany({
      include: {
        roomType: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
      },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
