import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(column = '') {
    super(`User${column ? `with this ${column}` : ''} already exists`, HttpStatus.CONFLICT);
  }
}

export class UsernameAlreadyExistsException extends HttpException {
  constructor() {
    super('Username already exists', HttpStatus.CONFLICT);
  }
}

export class UserNoExistsException extends HttpException {
  constructor() {
    super('User does not exist', HttpStatus.NOT_FOUND);
  }
}

export class UsernamePasswordNoExistsException extends HttpException {
  constructor() {
    super('Wrong username and/or password', HttpStatus.NOT_FOUND);
  }
}

export class UserNotRecoveringPasswordException extends HttpException {
  constructor() {
    super('User is not recovering password', HttpStatus.METHOD_NOT_ALLOWED);
  }
}
