import { Injectable, BadRequestException, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
        const userExists = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const { password, ...result } = newUser;
    return {
        message: "Usuario creado exitosamente",
        result,
        status: HttpStatus.OK,
    };
    } catch (error) {
        return {
            message: "Error interno",
            detalle: error,
            status: HttpStatus.BAD_REQUEST
        }
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'], 
    });
    return {
        message: "Usuarios encontrados exitosamente",
        users,
        status: HttpStatus.OK,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'], 
    });

    if (!user) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    return {
        message: "Usuario obtenido exitosamente",
        user,
        status: HttpStatus.OK,
    };
  }
  
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}