import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty()
  productId: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string | null; 
}