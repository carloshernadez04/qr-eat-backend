import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Category } from "src/modules/categories/entities/category.entity";

export class CreateProductDto{
    @IsString()
    @IsNotEmpty({message: "El nombre del producto es obligatorio"})
    name: string

    @IsString()
    @IsOptional()
    description: string

    @IsNotEmpty({message: "El precio del producto es obligatorio"})
    price: number

    @IsString()
    imageUrl: string

    @IsNotEmpty({message: "La categoria es obligatoria"})
    categoryId: string
}