import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  name: string;

  @IsUUID(4, { message: 'El ID del menú debe ser un UUID válido' })
  @IsNotEmpty()
  menuId: string;
}