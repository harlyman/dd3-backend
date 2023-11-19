import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultService } from 'src/defaults/defatul.service';
import { ResponseDataDTO } from 'src/dto/api.dto';

@Injectable()
export class ApiService extends DefaultService {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  constructor() {
    super(ApiService);
  }

  getInfo(): ResponseDataDTO {
    return {
      status: 'success',
      data: {
        description: this.config.get<string>('DESCRIPTION'),
        version: '1.1.1'
      }
    };
  }
}
