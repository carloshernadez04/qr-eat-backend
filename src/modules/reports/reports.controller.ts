import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @Roles(UserRole.ADMIN)
  getDailyDashboard() {
    return this.reportsService.getDailyDashboard();
  }

  @Get('live')
  @Roles(UserRole.ADMIN, UserRole.MESERO) 
  getLiveRestaurantStatus() {
    return this.reportsService.getLiveRestaurantStatus();
  }
}