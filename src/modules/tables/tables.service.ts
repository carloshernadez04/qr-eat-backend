import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    private readonly configService: ConfigService,
  ) {}

  async create(createTableDto: CreateTableDto) {
    try {
      const exists = await this.tablesRepository.findOne({
        where: { number: createTableDto.number },
      });
      if (exists) {
        throw new BadRequestException(
          `La mesa número ${createTableDto.number} ya está registrada.`,
        );
      }

      const token = crypto.randomBytes(8).toString('hex');

      const newTable = this.tablesRepository.create({
        ...createTableDto,
        token,
      });
      await this.tablesRepository.save(newTable);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';

      const menuUrl = `${frontendUrl}/menu?mesa=${newTable.number}&token=${newTable.token}`;

      const qrCodeBase64 = await QRCode.toDataURL(menuUrl);

      return {
        message: 'Mesa creada exitosamente',
        table: newTable,
        qrCode: qrCodeBase64,
        menuUrl,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const tables = await this.tablesRepository.find({
        order: { number: 'ASC' },
      });
      return {
        message: 'Mesas encontradas exitosamente',
        tables,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const table = await this.tablesRepository.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Mesa no encontrada');
    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    try {
      const table = await this.findOne(id);

      if (updateTableDto.number && updateTableDto.number !== table.number) {
        const exists = await this.tablesRepository.findOne({
          where: { number: updateTableDto.number },
        });
        if (exists)
          throw new BadRequestException(
            `El número de mesa ${updateTableDto.number} ya está en uso.`,
          );
      }

      Object.assign(table, updateTableDto);
      const tableUpdated = await this.tablesRepository.save(table);
      return {
        message: 'Mesa actualizazda exitosamente',
        tableUpdated,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const table = await this.findOne(id);
      table.isActive = false;
      await this.tablesRepository.save(table);
      return {
        message: `La mesa ${table.number} ha sido desactivada correctamente.`,
      };
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(id: string, status: TableStatus) {
    try {
      const table = await this.findOne(id);
      table.status = status;
      await this.tablesRepository.save(table);
      return {
        message: `La mesa ${table.number} ahora está ${status}.`,
        table,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTableQrCode(id: string) {
    try {
      const table = await this.findOne(id);

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';
      const menuUrl = `${frontendUrl}/menu?mesa=${table.number}&token=${table.token}`;

      const qrCodeBase64 = await QRCode.toDataURL(menuUrl);

      return {
        tableNumber: table.number,
        qrCode: qrCodeBase64,
      };
    } catch (error) {
      throw error;
    }
  }
}
