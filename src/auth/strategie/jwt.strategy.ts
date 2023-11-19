import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/api/users/users.service';
import { JWTPayloadInterface } from 'src/interfaces/api.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  @Inject(UsersService)
  private readonly userService: UsersService;
  @Inject(ConfigService)
  private readonly config: ConfigService;
  private logger: Logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')
    });
  }

  public async validate(payload: JWTPayloadInterface): Promise<any> {
    try {
      return await this.userService.getBy({ query: { guid: payload.guid }, withPassword: true });
    } catch (error) {
      throw new UnauthorizedException(`${JwtStrategy.name}[validate]:Action not allowed`);
    }
  }
}
