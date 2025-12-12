import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  QueryServicesDto,
} from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    // Check slug uniqueness
    const existing = await this.prisma.service.findUnique({
      where: { slug: createServiceDto.slug },
    });

    if (existing) {
      throw new ConflictException(
        `Service slug "${createServiceDto.slug}" already exists`,
      );
    }

    // Validate operating hours if provided
    if (createServiceDto.operatingHours) {
      this.validateOperatingHours(createServiceDto.operatingHours);
    }

    return this.prisma.service.create({
      data: createServiceDto as any,
    });
  }

  async findAll(query: QueryServicesDto) {
    const { category, isActive, search, page = 1, limit = 20 } = query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findByCategory(category: string) {
    return this.prisma.service.findMany({
      where: {
        category: category as any,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Check exists

    // Check slug uniqueness if changing
    if (updateServiceDto.slug) {
      const existing = await this.prisma.service.findUnique({
        where: { slug: updateServiceDto.slug },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Service slug "${updateServiceDto.slug}" already exists`,
        );
      }
    }

    if (updateServiceDto.operatingHours) {
      this.validateOperatingHours(updateServiceDto.operatingHours);
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if service has bookings
    const bookingsCount = await this.prisma.serviceBooking.count({
      where: { serviceId: id },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException(
        'Cannot delete service with existing bookings. Consider deactivating instead.',
      );
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }

  private validateOperatingHours(operatingHours: any) {
    // Validate that open time is before close time
    for (const [day, hours] of Object.entries(operatingHours)) {
      if ((hours as any).isClosed) continue;

      const openTime = (hours as any).open.split(':').map(Number);
      const closeTime = (hours as any).close.split(':').map(Number);

      const openMinutes = openTime[0] * 60 + openTime[1];
      const closeMinutes = closeTime[0] * 60 + closeTime[1];

      if (openMinutes >= closeMinutes) {
        throw new BadRequestException(
          `Invalid operating hours for ${day}: open time must be before close time`,
        );
      }
    }
  }
}
