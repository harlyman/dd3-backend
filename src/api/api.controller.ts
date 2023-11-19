import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { DefaultWithoutSecurityController } from 'src/defaults/default.without-security.controller';
import { ResponseDTO, ResponseDataDTO } from 'src/dto/api.dto';
import { LoginDTO, UserSignUpDTO } from 'src/dto/user.dto';
import { RoleEnum } from 'src/entities/roles.entity';
import { UtilsService } from 'src/utils/utils.service';
import { ApiService } from './api.service';
import { UsersService } from './users/users.service';

@Controller('')
@ApiTags('API')
export class ApiController extends DefaultWithoutSecurityController {
  @Inject(UtilsService)
  private readonly utilsService: UtilsService;
  @Inject(ApiService)
  private readonly apiService: ApiService;
  @Inject(UsersService)
  private readonly userService: UsersService;
  @Inject(AuthService)
  private readonly authService: AuthService;

  constructor() {
    super(ApiController);
  }

  @Get()
  @ApiOperation({ summary: 'API description and version' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.OK })
  getInfo(): ResponseDataDTO {
    return this.apiService.getInfo();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.INTERNAL_SERVER_ERROR })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.NOT_FOUND })
  async login(@Body() body: LoginDTO): Promise<ResponseDataDTO> {
    try {
      const user = await this.authService.validateUser({ username: body.username, password: body.password });
      const token = await this.authService.generateAccessToken({ user });
      return { status: 'success', data: token };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ApiController, error: error });
    }
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.CREATED })
  async singUp(@Body() body: UserSignUpDTO): Promise<ResponseDataDTO> {
    try {
      const user = await this.userService.create({ body: { ...body, isActive: true, roleGuid: RoleEnum.Player } });
      const token = await this.authService.generateAccessToken({ user });

      return { status: 'success', data: token };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ApiController, error: error });
    }
  }
}
