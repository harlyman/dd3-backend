import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../config/typeorm.service';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // CONFIGURATION
    ConfigModule.forRoot({ isGlobal: true }),
    // TYPEORM
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    // MODULES
    AuthModule,
    ApiModule
  ]
})
export class AppModule {}
