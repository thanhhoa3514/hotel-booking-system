import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  CancelBookingDto,
  CheckAvailabilityDto,
  QueryBookingsDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Check room availability (public endpoint)
   */
  @Public()
  @Post('check-availability')
  @UsePipes(ZodValidationPipe)
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(dto);
  }

  /**
   * Create a new booking (authenticated users)
   */
  @Post()
  @UsePipes(ZodValidationPipe)
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  /**
   * Get all bookings with filters (authenticated users see their own, admin/receptionist see all)
   */
  @Get()
  findAll(@Query() query: QueryBookingsDto, @CurrentUser() user: any) {
    // If user is not admin/receptionist, filter by their userId
    if (!['ADMIN', 'RECEPTIONIST', 'MANAGER'].includes(user.role?.name)) {
      query.userId = user.id;
    }
    return this.bookingsService.findAll(query);
  }

  /**
   * Get booking by ID (users can see their own, admin/receptionist see all)
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const booking = await this.bookingsService.findOne(id);

    // Check authorization
    if (
      booking.userId !== user.id &&
      !['ADMIN', 'RECEPTIONIST', 'MANAGER'].includes(user.role?.name)
    ) {
      throw new Error('Bạn không có quyền xem đặt phòng này');
    }

    return booking;
  }

  /**
   * Update booking (only for PENDING bookings)
   */
  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    const booking = await this.bookingsService.findOne(id);

    // Check authorization
    if (
      booking.userId !== user.id &&
      !['ADMIN', 'RECEPTIONIST', 'MANAGER'].includes(user.role?.name)
    ) {
      throw new Error('Bạn không có quyền cập nhật đặt phòng này');
    }

    return this.bookingsService.update(id, updateBookingDto);
  }

  /**
   * Update booking status (admin/receptionist only)
   */
  @Patch(':id/status')
  @Roles('ADMIN', 'RECEPTIONIST', 'MANAGER')
  @UsePipes(ZodValidationPipe)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  /**
   * Cancel booking (user can cancel their own, admin can cancel any)
   */
  @Delete(':id/cancel')
  @UsePipes(ZodValidationPipe)
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.cancel(id, user.id, dto);
  }

  /**
   * Hard delete booking (admin only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
