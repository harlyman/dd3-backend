import { Logger } from '@nestjs/common';

export class DefaultService {
  public logger: Logger;

  constructor(private object) {
    this.logger = new Logger(this.object.name);
  }
}
