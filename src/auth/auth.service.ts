import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/api/users/users.service';
import { UserEntity } from 'src/entities/users.entity';
import { UsernamePasswordNoExistsException } from 'src/exceptions/user.exception';
import { JWTPayloadInterface } from 'src/interfaces/api.interface';

@Injectable()
export class AuthService {
  @Inject(ConfigService)
  private readonly configService: ConfigService;
  @Inject(UsersService)
  private readonly userService: UsersService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async validateUser(params: { username: string; password: string }): Promise<UserEntity> {
    const user = await this.userService.getBy({ query: { username: params.username }, withPassword: true });

    if (user && (await bcrypt.compare(params.password, user.password))) {
      user.password = undefined;
      return user;
    }
    throw new UsernamePasswordNoExistsException();
  }

  async generateAccessToken(params: { user: UserEntity; expiresIn?: string }): Promise<{ token: string; user: UserEntity }> {
    const payload: JWTPayloadInterface = { guid: params.user.guid, role: params.user.role.guid, username: params.user.username };
    return {
      token: this.jwtService.sign(payload, { expiresIn: params.expiresIn || this.configService.get<string>('JWT_EXPIRE_IN') }),
      user: params.user
    };
  }
}
