import { Category } from 'src/modules/categories/entities/category.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Ej: "Menú Ejecutivo", "Menú de Fin de Semana"

  @Column({ type: 'varchar', nullable: true })
  description: string; // Ej: "Disponible solo de 12pm a 3pm"

  @Column({ default: true })
  isActive: boolean; // Si el admin lo apaga, desaparece del QR de los clientes


  @OneToMany(() => Category, (category) => category.menu)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}