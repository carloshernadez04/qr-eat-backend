import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateTableDto {
  @IsInt({ message: 'El número de mesa debe ser un número entero' })
  @IsPositive({ message: 'El número de mesa debe ser mayor a cero' })
  @IsNotEmpty({ message: 'El número de mesa es obligatorio' })
  number: number;

  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es de 1 persona' })
  capacity: number;
}