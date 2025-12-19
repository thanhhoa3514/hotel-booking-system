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
        const { images, ...roomTypeData } = createRoomTypeDto;
        const slug = this.generateSlug(roomTypeData.name);

        // Debug: Log received data
        console.log('=== CREATE ROOM TYPE ===');
        console.log('roomTypeData:', roomTypeData);
        console.log('images received:', images);
        console.log('images length:', images?.length || 0);

        // Check slug uniqueness
        const existing = await this.prisma.roomType.findUnique({
            where: { slug },
        });

        if (existing) {
            throw new ConflictException(`Room Type with name "${roomTypeData.name}" already exists`);
        }

        // Ensure only one image is marked as primary
        let processedImages = images || [];
        if (processedImages.length > 0) {
            const hasPrimary = processedImages.some(img => img.isPrimary);
            if (!hasPrimary) {
                // Set first image as primary if none specified
                processedImages = processedImages.map((img, index) => ({
                    ...img,
                    isPrimary: index === 0,
                }));
            } else {
                // Ensure only one is primary
                let foundPrimary = false;
                processedImages = processedImages.map(img => {
                    if (img.isPrimary && !foundPrimary) {
                        foundPrimary = true;
                        return img;
                    }
                    return { ...img, isPrimary: false };
                });
            }
        }

        return this.prisma.roomType.create({
            data: {
                ...roomTypeData,
                slug,
                amenities: roomTypeData.amenities || [],
                images: processedImages.length > 0 ? {
                    create: processedImages.map((img, index) => ({
                        url: img.url,
                        altText: img.altText,
                        isPrimary: img.isPrimary,
                        displayOrder: img.displayOrder ?? index,
                    })),
                } : undefined,
            },
            include: {
                images: true,
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

        const { images, ...roomTypeData } = updateRoomTypeDto;

        let slug;
        if (roomTypeData.name) {
            slug = this.generateSlug(roomTypeData.name);
            // Verify slug uniqueness if name changed
            const existing = await this.prisma.roomType.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Room Type with name "${roomTypeData.name}" already exists`);
            }
        }

        const data: any = { ...roomTypeData };
        if (slug) data.slug = slug;

        // Handle images update: delete all existing and create new ones
        if (images !== undefined) {
            // Delete existing images
            await this.prisma.roomImage.deleteMany({
                where: { roomTypeId: id },
            });

            // Create new images if provided
            if (images && images.length > 0) {
                await this.prisma.roomImage.createMany({
                    data: images.map((img, index) => ({
                        url: img.url,
                        altText: img.altText,
                        isPrimary: img.isPrimary ?? (index === 0),
                        displayOrder: img.displayOrder ?? index,
                        roomTypeId: id,
                    })),
                });
            }
        }

        return this.prisma.roomType.update({
            where: { id },
            data,
            include: {
                images: true,
            },
        });
    }

    async remove(id: string) {
        const roomType = await this.findOne(id);

        // Check if any rooms are using this room type
        const roomsCount = await this.prisma.room.count({
            where: { typeId: id },
        });

        if (roomsCount > 0) {
            throw new ConflictException(
                `Không thể xóa loại phòng "${roomType.name}" vì có ${roomsCount} phòng đang sử dụng loại phòng này`
            );
        }

        return this.prisma.roomType.delete({
            where: { id },
        });
    }
}
