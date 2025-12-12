import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateServiceBookingDto,
  UpdateServiceBookingDto,
  UpdateServiceBookingStatusDto,
  AssignStaffDto,
  CancelServiceBookingDto,
  QueryServiceBookingsDto,
} from './dto/service-booking.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ServiceBookingsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create service booking - charge to room
   */
  async create(createDto: CreateServiceBookingDto, userId: string) {
    const {
      serviceId,
      bookingId,
      scheduledDate,
      scheduledTime,
      duration,
      quantity,
      specialRequests,
    } = createDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate service exists and is active
      const service = await tx.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new NotFoundException('Không tìm thấy dịch vụ');
      }

      if (!service.isActive) {
        throw new BadRequestException('Dịch vụ hiện không khả dụng');
      }

      // 2. Validate room booking exists and guest is checked in
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          rooms: {
            include: {
              room: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt phòng');
      }

      // CRITICAL: Only allow service orders for CHECKED_IN guests
      if (booking.status !== 'CHECKED_IN') {
        throw new BadRequestException(
          'Chỉ khách đã check-in mới có thể đặt dịch vụ. Trạng thái hiện tại: ' +
          booking.status,
        );
      }

      // 3. Validate guest authorization (booking owner can order)
      if (booking.userId !== userId) {
        throw new ForbiddenException(
          'Bạn không có quyền đặt dịch vụ cho booking này',
        );
      }

      // 4. Check service availability (operating hours, capacity)
      await this.checkServiceAvailability(
        service,
        scheduledDate,
        scheduledTime,
        quantity,
        tx,
      );

      // 5. Calculate pricing
      const unitPrice = service.basePrice;
      let totalPrice = new Decimal(unitPrice);

      // Apply pricing type
      switch (service.pricingType) {
        case 'PER_PERSON':
          totalPrice = new Decimal(unitPrice).mul(quantity);
          break;
        case 'PER_HOUR':
          const hours =
            (duration ? duration : service.duration || 60) / 60;
          totalPrice = new Decimal(unitPrice).mul(hours).mul(quantity);
          break;
        case 'PER_ITEM':
          totalPrice = new Decimal(unitPrice).mul(quantity);
          break;
        case 'FIXED':
        default:
          totalPrice = new Decimal(unitPrice);
      }

      // 6. Generate service booking code
      const dateStr = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const todayCount = await tx.serviceBooking.count({
        where: {
          bookingCode: {
            startsWith: `SV${dateStr}`,
          },
        },
      });
      const bookingCode = `SV${dateStr}${String(todayCount + 1).padStart(3, '0')}`;

      // 7. Get room number from booking
      const roomNumber = booking.rooms
        .map((br) => br.room.roomNumber)
        .join(', ');

      // 8. Create service booking
      const serviceBooking = await tx.serviceBooking.create({
        data: {
          bookingCode,
          serviceId,
          bookingId,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          roomNumber,
          scheduledDate,
          scheduledTime,
          duration: duration || service.duration,
          quantity,
          unitPrice,
          totalPrice,
          status: 'PENDING',
          specialRequests,
          isChargedToRoom: true,
        },
        include: {
          service: true,
          booking: {
            select: {
              bookingCode: true,
              guestName: true,
            },
          },
        },
      });

      // 9. Update booking's service charge (add to total)
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          serviceCharge: {
            increment: totalPrice,
          },
          totalAmount: {
            increment: totalPrice,
          },
        },
      });

      return serviceBooking;
    });
  }

  /**
   * Check service availability
   */
  private async checkServiceAvailability(
    service: any,
    scheduledDate: Date,
    scheduledTime: Date,
    quantity: number,
    tx: any,
  ) {
    // Check if service requires booking
    if (service.requiresBooking) {
      // Check operating hours
      if (service.operatingHours) {
        const dayOfWeek = scheduledDate.toLocaleDateString('en-US', {
          weekday: 'long',
        }).toLowerCase();
        const hours = service.operatingHours[dayOfWeek];

        if (!hours || hours.isClosed) {
          throw new BadRequestException(
            `Dịch vụ không hoạt động vào ${dayOfWeek}`,
          );
        }

        const requestedTime = scheduledTime.toTimeString().slice(0, 5); // HH:MM
        if (requestedTime < hours.open || requestedTime > hours.close) {
          throw new BadRequestException(
            `Dịch vụ chỉ hoạt động từ ${hours.open} đến ${hours.close}`,
          );
        }
      }

      // Check capacity if applicable
      if (service.maxCapacity) {
        const existingBookings = await tx.serviceBooking.aggregate({
          where: {
            serviceId: service.id,
            scheduledDate,
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          },
          _sum: {
            quantity: true,
          },
        });

        const currentCapacity = existingBookings._sum.quantity || 0;
        if (currentCapacity + quantity > service.maxCapacity) {
          throw new BadRequestException(
            `Dịch vụ đã đầy. Sức chứa: ${service.maxCapacity}, Đã đặt: ${currentCapacity}`,
          );
        }
      }
    }
  }

  /**
   * Find all service bookings with filters
   */
  async findAll(
    query: QueryServiceBookingsDto,
    userRole?: string,
    userId?: string,
  ) {
    const {
      status,
      bookingId,
      serviceId,
      assignedStaffId,
      scheduledDate,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (bookingId) where.bookingId = bookingId;
    if (serviceId) where.serviceId = serviceId;
    if (assignedStaffId) where.assignedStaffId = assignedStaffId;
    if (scheduledDate) {
      where.scheduledDate = {
        gte: new Date(scheduledDate),
        lt: new Date(
          new Date(scheduledDate).setDate(new Date(scheduledDate).getDate() + 1),
        ),
      };
    }

    // If not admin/manager/receptionist, only show user's bookings
    if (!['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(userRole || '')) {
      where.booking = {
        userId,
      };
    }

    const [serviceBookings, total] = await Promise.all([
      this.prisma.serviceBooking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              imageUrl: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookingCode: true,
              guestName: true,
            },
          },
          assignedStaff: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
      }),
      this.prisma.serviceBooking.count({ where }),
    ]);

    return {
      data: serviceBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one service booking
   */
  async findOne(id: string) {
    const serviceBooking = await this.prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        service: true,
        booking: {
          include: {
            rooms: {
              include: {
                room: true,
              },
            },
          },
        },
        assignedStaff: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!serviceBooking) {
      throw new NotFoundException('Không tìm thấy đặt dịch vụ');
    }

    return serviceBooking;
  }

  /**
   * Update service booking (only PENDING status can be modified)
   */
  async update(id: string, updateDto: UpdateServiceBookingDto) {
    const existing = await this.findOne(id);

    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Chỉ có thể cập nhật đặt dịch vụ ở trạng thái PENDING',
      );
    }

    // Recalculate price if quantity changed
    const updateData: any = { ...updateDto };

    if (updateDto.quantity && updateDto.quantity !== existing.quantity) {
      const service = existing.service;
      let newTotalPrice = new Decimal(service.basePrice);

      switch (service.pricingType) {
        case 'PER_PERSON':
          newTotalPrice = new Decimal(service.basePrice).mul(updateDto.quantity);
          break;
        case 'PER_ITEM':
          newTotalPrice = new Decimal(service.basePrice).mul(updateDto.quantity);
          break;
        case 'PER_HOUR':
          const hours =
            (updateDto.duration || existing.duration || 60) / 60;
          newTotalPrice = new Decimal(service.basePrice)
            .mul(hours)
            .mul(updateDto.quantity);
          break;
      }

      updateData.totalPrice = newTotalPrice;

      // Update booking's service charge
      const priceDiff = newTotalPrice.sub(existing.totalPrice);
      await this.prisma.booking.update({
        where: { id: existing.bookingId },
        data: {
          serviceCharge: { increment: priceDiff },
          totalAmount: { increment: priceDiff },
        },
      });
    }

    return this.prisma.serviceBooking.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        booking: true,
      },
    });
  }

  /**
   * Update status (staff operation)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateServiceBookingStatusDto,
  ) {
    const { status, staffNotes } = updateStatusDto;

    const updateData: any = { status };
    if (staffNotes) updateData.staffNotes = staffNotes;

    // Set timestamps based on status
    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.chargedAt = new Date(); // Mark as charged when completed
    }

    return this.prisma.serviceBooking.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        booking: true,
      },
    });
  }

  /**
   * Assign staff to service booking
   */
  async assignStaff(id: string, assignStaffDto: AssignStaffDto) {
    const { assignedStaffId, staffNotes } = assignStaffDto;

    // Validate staff exists
    const staff = await this.prisma.user.findUnique({
      where: { id: assignedStaffId },
      include: { role: true },
    });

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // Only allow certain roles to be assigned
    const allowedRoles = ['RECEPTIONIST', 'HOUSEKEEPING', 'MANAGER'];
    if (!allowedRoles.includes(staff.role.name)) {
      throw new BadRequestException('Vai trò nhân viên không phù hợp');
    }

    return this.prisma.serviceBooking.update({
      where: { id },
      data: {
        assignedStaffId,
        staffNotes,
        status: 'CONFIRMED', // Auto-confirm when staff assigned
      },
      include: {
        service: true,
        assignedStaff: true,
      },
    });
  }

  /**
   * Cancel service booking
   */
  async cancel(id: string, cancelDto: CancelServiceBookingDto) {
    const existing = await this.findOne(id);

    // Can only cancel PENDING or CONFIRMED bookings
    if (!['PENDING', 'CONFIRMED'].includes(existing.status)) {
      throw new BadRequestException(
        'Không thể hủy đặt dịch vụ ở trạng thái hiện tại',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Refund service charge from booking
      await tx.booking.update({
        where: { id: existing.bookingId },
        data: {
          serviceCharge: { decrement: existing.totalPrice },
          totalAmount: { decrement: existing.totalPrice },
        },
      });

      // Update service booking
      return tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: cancelDto.cancelReason,
        },
        include: {
          service: true,
          booking: true,
        },
      });
    });
  }

  /**
   * Get service bookings by booking ID (for checkout summary)
   */
  async findByBookingId(bookingId: string) {
    return this.prisma.serviceBooking.findMany({
      where: {
        bookingId,
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        service: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}
