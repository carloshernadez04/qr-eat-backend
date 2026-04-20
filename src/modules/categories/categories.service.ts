import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = this.categoriesRepository.create({
        name: createCategoryDto.name,
        menu: { id: createCategoryDto.menuId },
      });
      const category = await this.categoriesRepository.save(newCategory);
      return {
        message: 'Categoria creada exitosamente',
        category,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const categories = await this.categoriesRepository.find({
        where: {isActive: true},
        relations: ['menu'],
      });
      return {
        message: 'Categorias encontradas exitosamente',
        categories,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id , isActive: true},
      relations: ['menu', 'products'],
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.name) category.name = updateCategoryDto.name;
    if (updateCategoryDto.menuId)
      category.menu = { id: updateCategoryDto.menuId } as any;

    return await this.categoriesRepository.save(category);
  }

  // async remove(id: string) {
  //   const category = await this.findOne(id);
  //   return await this.categoriesRepository.remove(category);
  // }

  async toggleActive(id: string, isActive: boolean) {
    const category = await this.findOne(id);
    category.isActive = isActive;
    await this.categoriesRepository.save(category);
    return {
      message: `Categoría '${category.name}' ${isActive ? 'activada' : 'desactivada'}.`,
    };
  }
}
