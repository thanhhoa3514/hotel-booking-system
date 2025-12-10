import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BookingsService {
  constructor(private readonly redisService: RedisService) {}

  // async getAvailableRooms(checkIn: Date, checkOut: Date) {
  //   const cacheKey = `rooms:available:${checkIn.toISOString()}:${checkOut.toISOString()}`;

  //   return this.redisService.getOrSet(
  //     cacheKey,
  //     async () => {
  //       // Query từ database (logic phức tạp)
  //       const rooms = await this.queryAvailableRoomsFromDB(checkIn, checkOut);
  //       return rooms;
  //     },
  //     300, // Cache 5 phút
  //   );
  // }
  // private async queryAvailableRoomsFromDB(checkIn: Date, checkOut: Date) {
  //   // Logic query database
  //   return [];
  // }

  // Invalidate cache khi có booking mới
  async createBooking(bookingData: any) {
    // ... create booking logic
    // Xóa cache rooms liên quan
    // await this.redisService.deleteByPattern('rooms:available:*');
    // return bookingData;
  }
  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  findAll() {
    return `This action returns all bookings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
