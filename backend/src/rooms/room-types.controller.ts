import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('room-types')
export class RoomTypesController {
    constructor(private readonly roomTypesService: RoomTypesService) { }

    @Post()
    @UsePipes(ZodValidationPipe)
    create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
        return this.roomTypesService.create(createRoomTypeDto);
    }

    @Get()
    findAll() {
        return this.roomTypesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.roomTypesService.findOne(id);
    }

    @Patch(':id')
    @UsePipes(ZodValidationPipe)
    update(@Param('id') id: string, @Body() updateRoomTypeDto: UpdateRoomTypeDto) {
        return this.roomTypesService.update(id, updateRoomTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roomTypesService.remove(id);
    }
}
