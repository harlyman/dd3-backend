import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RoleEntity } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, UtilsModule, TypeOrmModule.forFeature([UserEntity, RoleEntity]), forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
