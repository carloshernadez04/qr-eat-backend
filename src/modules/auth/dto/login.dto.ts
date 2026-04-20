import { IsEmail, IsString } from "class-validator";

// Idealmente crea un LoginDto con @IsEmail() y @IsString()
export class LoginDto{
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}