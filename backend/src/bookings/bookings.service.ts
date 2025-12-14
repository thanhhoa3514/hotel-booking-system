import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  CancelBookingDto,
  CheckAvailabilityDto,
  QueryBookingsDto,
} from './dto/booking.dto';
import { differenceInDays } from 'date-fns';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Check room availability for given dates
   */
  async checkAvailability(dto: CheckAvailabilityDto) {
    const { roomTypeId, checkInDate, checkOutDate, numberOfRooms = 1 } = dto;

    // Validate dates
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Ngày trả phòng phải sau ngày nhận phòng');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      throw new BadRequestException(
        'Ngày nhận phòng không được là ngày trong quá khứ',
      );
    }

    // Build query
    const where: any = {
      status: { in: ['AVAILABLE', 'CLEANING'] },
    };

    if (roomTypeId) {
      where.typeId = roomTypeId;
    }

    // Get all rooms of this type
    const allRooms = await this.prisma.room.findMany({
      where,
      include: {
        roomType: true,
      },
    });

    // Find rooms that are already booked for these dates
    const bookedRooms = await this.prisma.bookingRoom.findMany({
      where: {
        booking: {
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
          OR: [
            {
              // Booking overlaps: starts before checkout and ends after checkin
              AND: [
                { checkInDate: { lt: checkOutDate } },
                { checkOutDate: { gt: checkInDate } },
              ],
            },
          ],
        },
      },
      select: {
        roomId: true,
      },
    });

    const bookedRoomIds = new Set(bookedRooms.map((br) => br.roomId));
    const availableRooms = allRooms.filter(
      (room) => !bookedRoomIds.has(room.id),
    );

    return {
      available: availableRooms.length >= numberOfRooms,
      availableRooms,
      totalAvailable: availableRooms.length,
      requested: numberOfRooms,
    };
  }

  /**
   * Calculate booking price
   */
  async calculatePrice(
    roomIds: string[],
    checkInDate: Date,
    checkOutDate: Date,
    promotionCode?: string,
  ) {
    const numberOfNights = differenceInDays(checkOutDate, checkInDate);

    if (numberOfNights <= 0) {
      throw new BadRequestException('Số đêm phải lớn hơn 0');
    }

    let subtotal = 0;
    const roomPrices: Array<{
      roomId: string;
      pricePerNight: number;
      nights: number;
      total: number;
    }> = [];

    // Calculate price for each room
    for (const roomId of roomIds) {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
      });

      if (!room) {
        throw new NotFoundException(`Không tìm thấy phòng ${roomId}`);
      }

      // Check for dynamic pricing (PriceCalendar)
      // For simplicity, we'll use base price from room type
      const pricePerNight = Number(room.roomType.basePrice);
      const roomTotal = pricePerNight * numberOfNights;

      roomPrices.push({
        roomId,
        pricePerNight,
        nights: numberOfNights,
        total: roomTotal,
      });

      subtotal += roomTotal;
    }

    // Apply promotion if provided
    let discountAmount = 0;
    if (promotionCode) {
      const promotion = await this.prisma.promotion.findUnique({
        where: { code: promotionCode },
      });

      if (promotion) {
        const now = new Date();
        if (
          promotion.startDate <= now &&
          promotion.endDate >= now &&
          promotion.isActive
        ) {
          const discountValue = Number(promotion.discountValue);
          if (promotion.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * discountValue) / 100;
          } else {
            discountAmount = discountValue;
          }
        }
      }
    }

    // Calculate taxes and charges (10% tax, 5% service charge)
    const taxRate = 0.1;
    const serviceChargeRate = 0.05;

    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * taxRate;
    const serviceCharge = subtotalAfterDiscount * serviceChargeRate;
    const totalAmount = subtotalAfterDiscount + taxAmount + serviceCharge;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      serviceCharge,
      totalAmount,
      numberOfNights,
      roomPrices,
    };
  }

  /**
   * Create a new booking
   */
  async create(createBookingDto: CreateBookingDto) {
    const {
      userId,
      roomIds,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      guestIdNumber,
      numberOfGuests,
      specialRequests,
      promotionCode,
      bookingSource,
    } = createBookingDto;

    // Validate dates
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Ngày trả phòng phải sau ngày nhận phòng');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      throw new BadRequestException(
        'Ngày nhận phòng không được là ngày trong quá khứ',
      );
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Use transaction for data consistency
    return this.prisma.$transaction(async (tx) => {
      // Check room availability
      for (const roomId of roomIds) {
        const room = await tx.room.findUnique({
          where: { id: roomId },
        });

        if (!room) {
          throw new NotFoundException(`Không tìm thấy phòng ${roomId}`);
        }

        // Check if room is available (not booked for these dates)
        const conflictingBookings = await tx.bookingRoom.findFirst({
          where: {
            roomId,
            booking: {
              status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
              OR: [
                {
                  AND: [
                    { checkInDate: { lt: checkOutDate } },
                    { checkOutDate: { gt: checkInDate } },
                  ],
                },
              ],
            },
          },
        });

        if (conflictingBookings) {
          throw new ConflictException(
            `Phòng ${room.roomNumber} đã được đặt trong khoảng thời gian này`,
          );
        }
      }

      // Calculate pricing
      const pricing = await this.calculatePrice(
        roomIds,
        checkInDate,
        checkOutDate,
        promotionCode,
      );

      // Generate booking code (format: BK + YYYYMMDD + sequential number)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const todayBookings = await tx.booking.count({
        where: {
          bookingCode: {
            startsWith: `BK${dateStr}`,
          },
        },
      });
      const bookingCode = `BK${dateStr}${String(todayBookings + 1).padStart(3, '0')}`;

      // Create booking
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          guestName,
          guestEmail,
          guestPhone,
          guestIdNumber,
          checkInDate,
          checkOutDate,
          numberOfGuests,
          numberOfNights: pricing.numberOfNights,
          subtotal: pricing.subtotal,
          taxAmount: pricing.taxAmount,
          serviceCharge: pricing.serviceCharge,
          discountAmount: pricing.discountAmount,
          totalAmount: pricing.totalAmount,
          paidAmount: 0,
          status: 'PENDING',
          specialRequests,
          bookingSource,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
        },
      });

      // Create booking rooms
      for (const roomPrice of pricing.roomPrices) {
        await tx.bookingRoom.create({
          data: {
            bookingId: booking.id,
            roomId: roomPrice.roomId,
            pricePerNight: roomPrice.pricePerNight,
            numberOfNights: roomPrice.nights,
            totalPrice: roomPrice.total,
          },
        });
      }

      // Update room status to OCCUPIED
      await tx.room.updateMany({
        where: { id: { in: roomIds } },
        data: { status: 'OCCUPIED' },
      });

      // Fetch complete booking with relations
      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Find all bookings with filters
   */
  async findAll(query: QueryBookingsDto) {
    const {
      status,
      userId,
      checkInDate,
      checkOutDate,
      page = 1,
      limit = 20,
    } = query;

    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (checkInDate) {
      where.checkInDate = { gte: checkInDate };
    }

    if (checkOutDate) {
      where.checkOutDate = { lte: checkOutDate };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.booking.count({ where }),
    ]);


    return {
      data: bookings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }


  /**
   * Find one booking by ID
   */
  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        payments: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt phòng');
    }

    return booking;
  }

  /**
   * Update booking (only for PENDING bookings)
   */
  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(
        'Chỉ có thể cập nhật đặt phòng ở trạng thái PENDING',
      );
    }

    // If dates are changed, need to re-check availability and recalculate price
    if (updateBookingDto.checkInDate || updateBookingDto.checkOutDate) {
      const newCheckIn = updateBookingDto.checkInDate || booking.checkInDate;
      const newCheckOut = updateBookingDto.checkOutDate || booking.checkOutDate;

      // Re-check availability
      const roomIds = booking.rooms.map((br) => br.roomId);

      for (const roomId of roomIds) {
        const conflictingBookings = await this.prisma.bookingRoom.findFirst({
          where: {
            roomId,
            bookingId: { not: id }, // Exclude current booking
            booking: {
              status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
              OR: [
                {
                  AND: [
                    { checkInDate: { lt: newCheckOut } },
                    { checkOutDate: { gt: newCheckIn } },
                  ],
                },
              ],
            },
          },
        });

        if (conflictingBookings) {
          throw new ConflictException(
            'Phòng đã được đặt trong khoảng thời gian mới',
          );
        }
      }

      // Recalculate pricing
      const pricing = await this.calculatePrice(
        roomIds,
        newCheckIn,
        newCheckOut,
      );

      return this.prisma.booking.update({
        where: { id },
        data: {
          ...updateBookingDto,
          numberOfNights: pricing.numberOfNights,
          subtotal: pricing.subtotal,
          taxAmount: pricing.taxAmount,
          serviceCharge: pricing.serviceCharge,
          totalAmount: pricing.totalAmount,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
      });
    }

    // Simple update without date changes
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update booking status (admin/receptionist only)
   */
  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);
    const { status, staffNotes } = dto;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
      CHECKED_IN: ['CHECKED_OUT'],
      CHECKED_OUT: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${booking.status} sang ${status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status,
        staffNotes,
      };

      // Handle status-specific logic
      if (status === 'CHECKED_OUT') {
        updateData.checkOutTime = new Date();

        // Update rooms to CLEANING
        const roomIds = booking.rooms.map((br) => br.roomId);
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: 'CLEANING' },
        });
      }

      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();

        // Update rooms back to AVAILABLE
        const roomIds = booking.rooms.map((br) => br.roomId);
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: 'AVAILABLE' },
        });
      }

      if (status === 'CHECKED_IN') {
        updateData.checkInTime = new Date();
      }

      return tx.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Cancel booking (user or admin)
   */
  async cancel(id: string, userId: string, dto: CancelBookingDto) {
    const booking = await this.findOne(id);

    // Check if user owns this booking or is admin
    if (booking.userId !== userId) {
      // Should check if user is admin here
      throw new ForbiddenException('Bạn không có quyền hủy đặt phòng này');
    }

    // Check if booking can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException(
        'Chỉ có thể hủy đặt phòng ở trạng thái PENDING hoặc CONFIRMED',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Cancel all pending/confirmed service bookings when room booking cancelled
      const serviceBookings = await tx.serviceBooking.findMany({
        where: {
          bookingId: id,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      // Cancel each service booking
      for (const sb of serviceBookings) {
        await tx.serviceBooking.update({
          where: { id: sb.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: 'Room booking cancelled',
          },
        });
      }

      // Reset service charge on booking
      await tx.booking.update({
        where: { id },
        data: { serviceCharge: 0 },
      });

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancelReason: dto.cancelReason,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
      });

      // Update rooms back to AVAILABLE
      const roomIds = booking.rooms.map((br) => br.roomId);
      await tx.room.updateMany({
        where: { id: { in: roomIds } },
        data: { status: 'AVAILABLE' },
      });

      return updatedBooking;
    });
  }

  /**
   * Get booking with service charges for checkout
   */
  async getBookingForCheckout(id: string) {
    const booking = await this.findOne(id);

    // Get all service bookings
    const serviceBookings = await this.prisma.serviceBooking.findMany({
      where: {
        bookingId: id,
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
    });

    return {
      ...booking,
      serviceBookings,
      breakdown: {
        roomCharges: booking.subtotal,
        serviceCharges: booking.serviceCharge,
        taxAmount: booking.taxAmount,
        discountAmount: booking.discountAmount,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        balanceDue: Number(booking.totalAmount) - Number(booking.paidAmount),
      },
    };
  }

  /**
   * Remove/delete booking (hard delete - admin only)
   */
  async remove(id: string) {
    const booking = await this.findOne(id);

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
