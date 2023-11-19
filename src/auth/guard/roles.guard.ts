import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/entities/roles.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.role.guid === role);

    if (!hasRole) {
      throw new HttpException(
        {
          status: 'error',
          message: 'You do not have permission (Roles).'
        },
        HttpStatus.UNAUTHORIZED
      );
    }
    return true;
  }
}
