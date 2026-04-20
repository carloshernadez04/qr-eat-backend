import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp'; // FIX: Importación corregida
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private configService: ConfigService,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let imageUrl: string | null = null;

    if (file) {
      const uploadDir =
        this.configService.get<string>('UPLOAD_DIR') || './uploads';

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${uuidv4()}.webp`;
      const filePath = path.join(uploadDir, filename);

      try {
        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(filePath);

        imageUrl = `/uploads/${filename}`;
      } catch (error) {
        throw new BadRequestException('Error al procesar la imagen');
      }
    }

    const newProduct = this.productRepository.create({
      ...createProductDto,
      imageUrl: imageUrl ?? undefined,
      category: { id: createProductDto.categoryId },
    });

    const product = await this.productRepository.save(newProduct);
    return {
      message: 'Producto creado exitosamente',
      product,
      status: HttpStatus.OK,
    };
  }

  async findAll() {
    try {
      const products = await this.productRepository.find({
        where: { isAvailable: true },
        relations: ['category'],
      });
      return {
        message: 'Productos obtenidos exitosamente',
        products,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, isAvailable: true },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);
    let newImageUrl = product.imageUrl;

    if (file) {
      const uploadDir =
        this.configService.get<string>('UPLOAD_DIR') || './uploads';
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `${uuidv4()}.webp`;
      const filePath = path.join(uploadDir, filename);

      try {
        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(filePath);
        newImageUrl = `/uploads/${filename}`;

      } catch (error) {
        throw new BadRequestException('Error al procesar la nueva imagen');
      }
    }

    Object.assign(product, { ...updateProductDto, imageUrl: newImageUrl });

    if (updateProductDto.categoryId) {
      product.category = { id: updateProductDto.categoryId } as any;
    }

    const productUpdated = await this.productRepository.save(product);
    return {
      message: "Producto actualizado exitosamentete",
      productUpdated,
      status: HttpStatus.OK,
    }
  }

  // async remove(id: string) {
  //   const product = await this.findOne(id);
  //   return await this.productRepository.remove(product);
  // }

  async toggleAvailability(id: string, isAvailable: boolean) {
    const product = await this.findOne(id);
    product.isAvailable = isAvailable;
    await this.productRepository.save(product);
    return {
      message: `El producto '${product.name}' ha sido marcado como ${isAvailable ? 'Disponible' : 'Agotado'}.`,
      product,
    };
  }

  async getFullMenuForClient() {
    return await this.productRepository.find({
      where: {
        isAvailable: true,
        category: { isActive: true, menu: { isActive: true } },
      },
      relations: ['category', 'category.menu'],
    });
  }
}
