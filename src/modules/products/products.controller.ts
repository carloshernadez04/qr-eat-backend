import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createProductDto: any, @UploadedFile() file: Express.Multer.File) {
    if (createProductDto.price) createProductDto.price = parseFloat(createProductDto.price);
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MESERO)
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (updateProductDto.price) updateProductDto.price = parseFloat(updateProductDto.price);
    return this.productsService.update(id, updateProductDto, file);
  }

  // @Delete(':id')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.productsService.remove(id);
  // }

  // --- RUTAS ESPECIALES ---

  // Marcar como Disponible/Agotado (Cocina y Admin)
  @Patch(':id/availability')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COCINA)
  toggleAvailability(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body('isAvailable') isAvailable: boolean
  ) {
    return this.productsService.toggleAvailability(id, isAvailable);
  }

  // --- RUTAS PÚBLICAS (Para el QR del comensal) ---

  @Get('client/menu')
  getFullMenu() {
    return this.productsService.getFullMenuForClient();
  }
}