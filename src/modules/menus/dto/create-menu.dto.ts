import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del menú es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}