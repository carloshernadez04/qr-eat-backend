import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsUUID(4, { message: 'El ID de la mesa no es válido' })
  @IsNotEmpty()
  tableId: string;

  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ValidateNested({ each: true }) 
  @Type(() => CreateOrderItemDto) 
  items: CreateOrderItemDto[];
}