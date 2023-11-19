import { HttpException, HttpStatus } from '@nestjs/common';

export class MaxAttepmtsException extends HttpException {
  constructor() {
    super('User has reached the maximum number of attempts', HttpStatus.CONFLICT);
  }
}
