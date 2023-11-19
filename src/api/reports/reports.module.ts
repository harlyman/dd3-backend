import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ChallengeUserEntity } from 'src/entities/challengeUser.entity';
import { RoleEntity } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeUserEntity, UserEntity, RoleEntity, WordEntity]), forwardRef(() => AuthModule), UtilsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService]
})
export class ReportsModule {}
