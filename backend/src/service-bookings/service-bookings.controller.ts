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
import { ServiceBookingsService } from './service-bookings.service';
import {
  CreateServiceBookingDto,
  UpdateServiceBookingDto,
  UpdateServiceBookingStatusDto,
  AssignStaffDto,
  CancelServiceBookingDto,
  QueryServiceBookingsDto,
} from './dto/service-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('service-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceBookingsController {
  constructor(
    private readonly serviceBookingsService: ServiceBookingsService,
  ) {}

  /**
   * Create service booking (Authenticated guests with CHECKED_IN booking)
   */
  @Post()
  @UsePipes(ZodValidationPipe)
  create(
    @Body() createDto: CreateServiceBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceBookingsService.create(createDto, user.id);
  }

  /**
   * Get all service bookings
   * - Guests see only their bookings
   * - Staff see all bookings
   */
  @Get()
  findAll(@Query() query: QueryServiceBookingsDto, @CurrentUser() user: any) {
    return this.serviceBookingsService.findAll(
      query,
      user.role?.name,
      user.id,
    );
  }

  /**
   * Get service booking by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceBookingsService.findOne(id);
  }

  /**
   * Update service booking (only PENDING bookings)
   */
  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceBookingDto,
  ) {
    return this.serviceBookingsService.update(id, updateDto);
  }

  /**
   * Update service booking status (Staff only)
   */
  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING')
  @UsePipes(ZodValidationPipe)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateServiceBookingStatusDto,
  ) {
    return this.serviceBookingsService.updateStatus(id, updateStatusDto);
  }

  /**
   * Assign staff to service booking (Manager/Receptionist)
   */
  @Patch(':id/assign-staff')
  @Roles('ADMIN', 'MANAGER', 'RECEPTIONIST')
  @UsePipes(ZodValidationPipe)
  assignStaff(
    @Param('id') id: string,
    @Body() assignStaffDto: AssignStaffDto,
  ) {
    return this.serviceBookingsService.assignStaff(id, assignStaffDto);
  }

  /**
   * Cancel service booking
   */
  @Delete(':id/cancel')
  @UsePipes(ZodValidationPipe)
  cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelServiceBookingDto,
  ) {
    return this.serviceBookingsService.cancel(id, cancelDto);
  }

  /**
   * Get service bookings by booking ID (for checkout)
   */
  @Get('booking/:bookingId')
  findByBookingId(@Param('bookingId') bookingId: string) {
    return this.serviceBookingsService.findByBookingId(bookingId);
  }
}
