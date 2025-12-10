import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomTypesService } from './room-types.service';
import { RoomTypesController } from './room-types.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController, RoomTypesController],
  providers: [RoomsService, RoomTypesService],
  exports: [RoomsService, RoomTypesService],
})
export class RoomsModule { }
