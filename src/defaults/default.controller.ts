import { HttpStatus, Logger, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseDTO } from 'src/dto/api.dto';
import { RoleEnum } from 'src/entities/roles.entity';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Auth = (...roles: RoleEnum[]) => applyDecorators(UseGuards(JwtAuthGuard), Roles(...roles), UseGuards(RolesGuard));

@ApiBearerAuth()
@ApiResponse({ type: ResponseDTO, status: HttpStatus.INTERNAL_SERVER_ERROR })
@ApiResponse({ type: ResponseDTO, status: HttpStatus.UNAUTHORIZED })
export class DefaultController {
  public logger: Logger;

  constructor(private object) {
    this.logger = new Logger(this.object.name);
  }
}
