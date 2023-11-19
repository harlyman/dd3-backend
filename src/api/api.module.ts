import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsModule } from 'src/utils/utils.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ChallengesModule } from './challenges/challenges.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UtilsModule, UsersModule, ChallengesModule, ReportsModule],
  providers: [ApiService],
  controllers: [ApiController]
})
export class ApiModule {}
