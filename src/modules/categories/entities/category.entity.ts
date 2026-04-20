import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { Product } from 'src/modules/products/entities/product.entity';
import { Menu } from 'src/modules/menus/entities/menu.entity';


@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; 

  @Column({ default: true })
  isActive: boolean; 

  @ManyToOne(() => Menu, (menu) => menu.categories, { onDelete: 'CASCADE' })
  menu: Menu;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}