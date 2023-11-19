import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const CONFIG_SERVICE = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: CONFIG_SERVICE.get<string>('DATABASE_HOST'),
  port: CONFIG_SERVICE.get<number>('DATABASE_PORT'),
  username: CONFIG_SERVICE.get<string>('DATABASE_USERNAME'),
  password: CONFIG_SERVICE.get<string>('DATABASE_PASSWORD'),
  database: CONFIG_SERVICE.get<string>('DATABASE_NAME'),
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
  synchronize: false
});
