import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
// somewhere in your initialization file

const LOGGER = new Logger('API');
if (!process.env.TZ) {
  LOGGER.warn('Enviroment TZ is necessary');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? ['log', 'debug', 'error', 'verbose', 'warn'] : ['log', 'error', 'warn']
  });
  const config: ConfigService = app.get(ConfigService);

  const envBasePath = config.get<string>('BASEPATH');
  const basepath =
    envBasePath && envBasePath.length > 1
      ? envBasePath.charAt(envBasePath.length - 1) === '/'
        ? envBasePath.substring(0, envBasePath.length - 1)
        : envBasePath
      : '';
  if (basepath !== '') {
    app.setGlobalPrefix(basepath);
  }

  app.use(helmet());
  // CORS Configuration
  const configCORS = { origin: ['*'], methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS' };
  switch (process.env.NODE_ENV) {
    case 'development':
      configCORS.origin = ['http://localhost:5000'];
      break;
    case 'production':
      configCORS.origin = ['https://dd3-backend-dev.dacodes.com'];
      break;
  }
  app.enableCors(configCORS);

  let swaggetPath = '';
  if (process.env.SWAGGER_DOCS && process.env.SWAGGER_DOCS === '1') {
    const configSwagger = new DocumentBuilder()
      .setTitle(config.get<string>('DESCRIPTION'))
      .setVersion('1.0')
      .addBearerAuth({ type: 'apiKey', name: 'Authorization', in: 'header', description: 'JWT Token use Bearer' })
      .build();
    const document = SwaggerModule.createDocument(app, configSwagger);
    swaggetPath = `${basepath}${basepath !== '' ? '/' : ''}api-docs`;
    SwaggerModule.setup(swaggetPath, app, document);
  }

  // class-validaror
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(config.get<number>('PORT'));

  LOGGER.log(`API Time Zone - ${config.get<string>('TZ')}`);
  LOGGER.log(`API Started - ${await app.getUrl()}/${basepath}`);
  LOGGER.log(`Swagger Docs - ${await app.getUrl()}/${basepath}${basepath !== '' ? '/' : ''}api-docs`);
}
bootstrap();
