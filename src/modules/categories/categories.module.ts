import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. Importar TypeOrmModule
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity'; // 2. Importar la Entidad

@Module({
  // 3. AGREGAR ESTO: Conecta la entidad a este módulo
  imports: [TypeOrmModule.forFeature([Category])], 
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], // Lo exportamos por si otro módulo lo necesita
})
export class CategoriesModule {}