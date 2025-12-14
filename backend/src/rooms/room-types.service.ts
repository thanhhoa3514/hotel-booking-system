import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';

@Injectable()
export class RoomTypesService {
    constructor(private prisma: PrismaService) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async create(createRoomTypeDto: CreateRoomTypeDto) {
        const slug = this.generateSlug(createRoomTypeDto.name);

        // Check slug uniqueness
        const existing = await this.prisma.roomType.findUnique({
            where: { slug },
        });

        if (existing) {
            throw new ConflictException(`Room Type with name "${createRoomTypeDto.name}" already exists`);
        }

        return this.prisma.roomType.create({
            data: {
                ...createRoomTypeDto,
                slug,
                amenities: createRoomTypeDto.amenities ? JSON.stringify(createRoomTypeDto.amenities) : [],
            },
        });
    }

    async findAll(query?: { page?: number; limit?: number }) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;

        const [roomTypes, total] = await Promise.all([
            this.prisma.roomType.findMany({
                include: {
                    images: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.roomType.count(),
        ]);

        return {
            data: roomTypes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async findOne(id: string) {
        const roomType = await this.prisma.roomType.findUnique({
            where: { id },
            include: {
                rooms: true,
                images: true,
            }
        });
        if (!roomType) {
            throw new NotFoundException(`Room Type with ID ${id} not found`);
        }
        return roomType;
    }

    async update(id: string, updateRoomTypeDto: UpdateRoomTypeDto) {
        await this.findOne(id); // Ensure exists

        let slug;
        if (updateRoomTypeDto.name) {
            slug = this.generateSlug(updateRoomTypeDto.name);
            // Verify slug uniqueness if name changed
            const existing = await this.prisma.roomType.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Room Type with name "${updateRoomTypeDto.name}" already exists`);
            }
        }

        const data: any = { ...updateRoomTypeDto };
        if (slug) data.slug = slug;
        if (updateRoomTypeDto.amenities) {
            data.amenities = JSON.stringify(updateRoomTypeDto.amenities);
        }

        return this.prisma.roomType.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.roomType.delete({
            where: { id },
        });
    }
}
