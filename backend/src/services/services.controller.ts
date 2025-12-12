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
import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  QueryServicesDto,
} from './dto/service.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Get all services (public - for guest browsing)
   */
  @Public()
  @Get()
  findAll(@Query() query: QueryServicesDto) {
    return this.servicesService.findAll(query);
  }

  /**
   * Get service by ID (public)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /**
   * Create service (Admin/Manager only)
   */
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @UsePipes(ZodValidationPipe)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  /**
   * Update service (Admin/Manager only)
   */
  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @UsePipes(ZodValidationPipe)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  /**
   * Delete service (Admin only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  /**
   * Get services by category (public)
   */
  @Public()
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.servicesService.findByCategory(category);
  }
}
