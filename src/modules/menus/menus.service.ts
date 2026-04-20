import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menusRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    try {
      const newMenu = this.menusRepository.create(createMenuDto);
      const menu = await this.menusRepository.save(newMenu);
      return {
        message: 'Menu creado exitosamnete',
        menu,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const menus = await this.menusRepository.find({
        where: {isActive: true},
        relations: ['categories'],
      });
      return {
        message: 'Menus obtenidos exitosamnete',
        menus,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const menu = await this.menusRepository.findOne({
      where: { id , isActive: true}, 
      relations: ['categories'],
    });
    if (!menu) throw new NotFoundException('Menú no encontrado');
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    const menuUpdated = await this.menusRepository.save(menu);
    return {
      message: "Menu actualizado exitosamente",
      menuUpdated,
      status: HttpStatus.OK,
    }
  }

  // async remove(id: string) {
  //   const menu = await this.findOne(id);
  //   return await this.menusRepository.remove(menu);
  // }

  async toggleActive(id: string, isActive: boolean) {
    const menu = await this.findOne(id);
    menu.isActive = isActive;
    await this.menusRepository.save(menu);
    return {
      message: `Menú '${menu.name}' ${isActive ? 'activado' : 'desactivado'}.`,
    };
  }
}
