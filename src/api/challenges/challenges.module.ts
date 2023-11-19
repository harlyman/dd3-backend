import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ChallengeEntity } from 'src/entities/challenge.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';

@Module({
  imports: [TypeOrmModule.forFeature([WordEntity, ChallengeEntity]), forwardRef(() => AuthModule), UtilsModule],
  providers: [ChallengesService],
  controllers: [ChallengesController],
  exports: [ChallengesService]
})
export class ChallengesModule {}
