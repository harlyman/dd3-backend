import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/entities/roles.entity';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
