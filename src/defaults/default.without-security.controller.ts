import { HttpStatus, Logger } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ResponseDTO } from 'src/dto/api.dto';

@ApiResponse({ type: ResponseDTO, status: HttpStatus.INTERNAL_SERVER_ERROR })
export class DefaultWithoutSecurityController {
  public logger: Logger;

  constructor(private object) {
    this.logger = new Logger(this.object.name);
  }
}
